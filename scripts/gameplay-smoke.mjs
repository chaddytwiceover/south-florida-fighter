import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';

const url = checkedUrl(process.argv[2] || 'http://127.0.0.1:8080');
const out = checkedOutputPath(process.argv[3] || '/workspace/screenshots/gameplay', ['/workspace']);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const results = [];
try {
  for (const viewport of [{width:1280,height:800}, {width:390,height:844}]) {
    const name = viewport.width === 390 ? 'mobile' : 'desktop';
    const page = await browser.newPage({ viewport, hasTouch: name === 'mobile' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.setDefaultTimeout(20000);
    try {
      await page.goto(url, {waitUntil:'domcontentloaded'});
      await page.getByRole('button', {name:/enter championship/i}).click();
      await page.waitForFunction(() => Boolean(window.__controlsTest));
      const menuHealth = await page.evaluate(() => window.__controlsTest.getHealth());
      await page.waitForTimeout(1200);
      assert.equal(await page.evaluate(() => window.__controlsTest.getHealth()), menuHealth, 'health changed behind title');
      await page.getByRole('button', {name:/enter florida circuit/i}).click();
      const generation = await page.evaluate(() => window.__playGeneration || 0);
      await page.getByRole('button', {name:/fight in fort lauderdale/i}).click();
      await page.getByTestId('hud').waitFor();
      await page.waitForFunction(g => window.__playGeneration > g && window.__controlsTest?.getGrounded(), generation);
      const x = await page.evaluate(() => window.__controlsTest.getX());
      await page.keyboard.down('KeyD');
      await page.waitForFunction(x => window.__controlsTest.getX() > x + 30, x);
      await page.keyboard.up('KeyD');
      const right = await page.evaluate(() => window.__controlsTest.getX());
      await page.keyboard.down('KeyA');
      await page.waitForFunction(x => window.__controlsTest.getX() < x - 25, right);
      await page.keyboard.up('KeyA');
      await page.keyboard.down('Space');
      await page.waitForFunction(() => !window.__controlsTest.getGrounded());
      await page.keyboard.up('Space');
      await page.waitForFunction(() => window.__controlsTest.getGrounded());
      await page.keyboard.down('KeyJ');
      await page.waitForFunction(() => Boolean(window.__controlsTest.getCurrentMove()));
      await page.keyboard.up('KeyJ');
      await page.screenshot({path:out+'/'+name+'-attack.png'});
      await page.waitForFunction(() => !window.__controlsTest.getCurrentMove());
      const before = await page.evaluate(() => window.__playGeneration);
      await page.keyboard.down('Escape');
      await page.getByRole('button', {name:/fight in fort lauderdale/i}).waitFor();
      await page.keyboard.up('Escape');
      await page.getByRole('button', {name:/fight in fort lauderdale/i}).click();
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
      await page.screenshot({path:out+'/'+name+'-play.png'});
      results.push({name,passed:true,...state});
    } catch(e) {
      await page.screenshot({path:out+'/'+name+'-failure.png'}).catch(()=>{});
      results.push({name,passed:false,error:e.stack || String(e),errors});
      process.exitCode=1;
    } finally { await page.close(); }
  }
} finally {
  await browser.close();
  await writeFile(out+'/results.json', JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
}
