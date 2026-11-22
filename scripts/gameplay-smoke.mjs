import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';

const url = checkedUrl(process.argv[2] || 'http://127.0.0.1:8080');
const out = checkedOutputPath(process.argv[3] || 'test-results/gameplay', [process.cwd() + '/test-results']);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const results = [];
try {
  for (const viewport of [{width:1280,height:800}, {width:390,height:844}]) {
    const name = viewport.width === 390 ? 'mobile' : 'desktop';
    const mobile = name === 'mobile';
    const page = await browser.newPage({ viewport, isMobile: mobile, hasTouch: mobile });
    const touch = mobile ? await page.context().newCDPSession(page) : null;
    const activate = locator => mobile ? locator.tap() : locator.click();
    async function holdInput(code, label, until, arg) {
      if (touch) {
        const button = page.getByRole('button', {name:label, exact:true});
        await button.tap({trial:true});
        const { x, y, width, height } = await button.boundingBox();
        // Playwright exposes taps but not touch holds. Keep the finger down until
        // Phaser observes the action, then always send the release.
        await touch.send('Input.dispatchTouchEvent', {
          type:'touchStart',
          touchPoints:[{x:x+width/2, y:y+height/2}],
        });
        try {
          await page.waitForFunction(until, arg);
        } finally {
          await touch.send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
        }
        return;
      }
      await page.keyboard.down(code);
      try {
        await page.waitForFunction(until, arg);
      } finally {
        await page.keyboard.up(code);
      }
    }
    async function enterArena(arena) {
      await activate(page.getByTestId('circuit-map-button'));
      const generation = await page.evaluate(() => window.__playGeneration);
      await activate(page.getByRole('button', {name:'Play '+arena, exact:true}));
      await page.waitForFunction(g => window.__playGeneration > g && window.__controlsTest?.getGrounded(), generation);
      await page.getByTestId('hud').getByText(arena, {exact:false}).waitFor();
      assert(await page.evaluate(() => window.__controlsTest.getEnemyCount() > 0));
    }
    async function landOnFirstPlatform() {
      const floor = await page.evaluate(() => window.__controlsTest.getY());
      await holdInput('KeyD', 'Move right', () => window.__controlsTest.getX() >= 370);
      await holdInput('Space', 'Jump', floorY =>
        window.__controlsTest.getGrounded() && window.__controlsTest.getY() < floorY - 45, floor);
    }
    const errors = [];
    let arenaUnderTest = 'A1A Ocean Boardwalk';
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.setDefaultTimeout(20000);
    try {
      await page.goto(url, {waitUntil:'domcontentloaded'});
      await activate(page.getByRole('button', {name:/enter championship/i}));
      await page.waitForFunction(() => Boolean(window.__controlsTest));
      const menuHealth = await page.evaluate(() => window.__controlsTest.getHealth());
      await page.waitForTimeout(1200);
      assert.equal(await page.evaluate(() => window.__controlsTest.getHealth()), menuHealth, 'health changed behind title');
      await activate(page.getByRole('button', {name:/enter florida circuit/i}));
      const generation = await page.evaluate(() => window.__playGeneration || 0);
      await activate(page.getByRole('button', {name:/fight in fort lauderdale/i}));
      await page.getByTestId('hud').waitFor();
      await page.waitForFunction(g => window.__playGeneration > g && window.__controlsTest?.getGrounded(), generation);
      const x = await page.evaluate(() => window.__controlsTest.getX());
      await holdInput('KeyD', 'Move right', x => window.__controlsTest.getX() > x + 30 && window.__controlsTest.getFacing() === 1, x);
      await page.waitForFunction(() => window.__controlsTest.getMoveX() === 0);
      const right = await page.evaluate(() => window.__controlsTest.getX());
      await holdInput('KeyA', 'Move left', x => window.__controlsTest.getX() < x - 25 && window.__controlsTest.getFacing() === -1, right);
      await page.waitForFunction(() => window.__controlsTest.getMoveX() === 0);
      await holdInput('Space', 'Jump', () => !window.__controlsTest.getGrounded());
      await page.waitForFunction(() => window.__controlsTest.getGrounded());
      await holdInput('KeyJ', 'Light Attack', () => window.__controlsTest.getCurrentMove() === 'Street Jab');
      await page.screenshot({path:out+'/'+name+'-attack.png'});
      await page.waitForFunction(() => !window.__controlsTest.getCurrentMove());
      const before = await page.evaluate(() => window.__playGeneration);
      if (mobile) {
        await activate(page.getByTestId('circuit-map-button'));
      } else {
        await page.keyboard.down('Escape');
        await page.getByRole('button', {name:/fight in fort lauderdale/i}).waitFor();
        await page.keyboard.up('Escape');
      }
      await activate(page.getByRole('button', {name:/fight in fort lauderdale/i}));
      await page.waitForFunction(g => window.__playGeneration > g && window.__controlsTest?.getGrounded(), before);
      const state = await page.evaluate(() => ({
        x:window.__controlsTest.getX(), y:window.__controlsTest.getY(),
        enemies:window.__controlsTest.getEnemyCount(), renderer:window.__controlsTest.getRenderer(),
        canvasCount:document.querySelectorAll('canvas').length,
        overflow:document.documentElement.scrollWidth > innerWidth + 1,
      }));
      assert.equal(state.canvasCount, 1, 'restart leaked a canvas');
      assert(state.enemies > 0, 'restart has no enemies');
      assert.equal(state.overflow, false, 'horizontal overflow');
      assert.equal(errors.length, 0, errors.join('\n'));
      await landOnFirstPlatform();
      await page.screenshot({path:out+'/'+name+'-play.png'});
      const pad = page.getByRole('button', {name:'Move left', includeHidden:true});
      await pad.waitFor({state:'attached'});
      assert.equal(await pad.isVisible(), mobile);
      assert.equal(await page.getByText('Rotate to portrait').isVisible(), false);
      const hud = await page.getByTestId('hud').boundingBox();
      const canvas = await page.locator('canvas').boundingBox();
      assert(Math.abs(hud.width - canvas.width) < 2 && Math.abs(hud.x - canvas.x) < 2);
      const arenas = ['A1A Ocean Boardwalk'];
      for (const arena of ['Ybor City Neon Strip', 'Worth Avenue Promenade', 'Wynwood Graffiti District', 'Ocean Drive Art Deco Strip']) {
        arenaUnderTest = arena;
        await enterArena(arena);
        await holdInput('KeyJ', 'Light Attack', () => window.__controlsTest.getCurrentMove() === 'Street Jab');
        await page.waitForFunction(() => !window.__controlsTest.getCurrentMove());
        // Start each input check outside combat so enemy hitstun cannot mask it.
        await enterArena(arena);
        await landOnFirstPlatform();
        const arenaSlug = arena.toLowerCase().replaceAll(' ', '-');
        await page.screenshot({path:out+'/'+name+'-'+arenaSlug+'.png'});
        arenas.push(arena);
      }
      await activate(page.getByTestId('circuit-map-button'));
      await page.getByRole('heading', {name:'Choose Your Arena'}).waitFor();
      assert.equal(errors.length, 0, errors.join('\n'));
      results.push({name,input:mobile ? 'touch' : 'keyboard',passed:true,arenas,...state});
    } catch(e) {
      await page.screenshot({path:out+'/'+name+'-failure.png'}).catch(()=>{});
      results.push({name,arena:arenaUnderTest,passed:false,error:e.stack || String(e),errors});
      process.exitCode=1;
    } finally { await page.close(); }
  }
} finally {
  await browser.close();
  await writeFile(out+'/results.json', JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
}
