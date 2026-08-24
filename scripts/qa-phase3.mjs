import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const errors = [];
await mkdir("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({ args: ["--no-sandbox"] });

async function boot(page) {
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("http://127.0.0.1:8080/?qa=p3", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(700);
}

async function startPlay(page) {
  await page.getByRole("button", { name: /choose fighter/i }).click();
  await page.getByTestId("confirm-fighter").waitFor({ timeout: 5000 });
  const gen0 = await page.evaluate(() => window.__playGeneration || 0);
  await page.getByTestId("confirm-fighter").click();
  await page.getByTestId("hud").waitFor({ timeout: 8000 });
  await page.waitForFunction((g) => (window.__playGeneration || 0) > g, gen0, { timeout: 10000 });
  await page.waitForFunction(
    () => window.__controlsTest && window.__controlsTest.getGrounded() && window.__controlsTest.getY() < 1000,
    null,
    { timeout: 10000 },
  );
  await page.waitForTimeout(500);
}

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await boot(mobile);
await mobile.screenshot({ path: "/workspace/screenshots/p3-mobile-title.png" });
await startPlay(mobile);
await mobile.screenshot({ path: "/workspace/screenshots/p3-mobile-play.png" });

const x0 = await mobile.evaluate(() => window.__controlsTest.getX());
await mobile.evaluate(() => window.__controlsTest.setKeys(["KeyA"]));
await mobile.waitForTimeout(450);
const left = await mobile.evaluate(() => ({
  x: window.__controlsTest.getX(),
  facing: window.__controlsTest.getFacing(),
  grounded: window.__controlsTest.getGrounded(),
}));
await mobile.screenshot({ path: "/workspace/screenshots/p3-mobile-left.png" });
await mobile.evaluate(() => window.__controlsTest.setKeys([]));
await mobile.waitForTimeout(250);
await mobile.evaluate(() => window.__controlsTest.setKeys(["KeyD"]));
await mobile.waitForTimeout(700);
const right = await mobile.evaluate(() => ({
  x: window.__controlsTest.getX(),
  facing: window.__controlsTest.getFacing(),
  grounded: window.__controlsTest.getGrounded(),
  enemies: window.__controlsTest.getEnemyCount(),
  health: window.__controlsTest.getHealth(),
}));
await mobile.screenshot({ path: "/workspace/screenshots/p3-mobile-right.png" });
await mobile.evaluate(() => window.__controlsTest.setKeys([]));
await mobile.keyboard.press("KeyJ");
await mobile.waitForTimeout(240);
await mobile.screenshot({ path: "/workspace/screenshots/p3-mobile-attack.png" });

const desktop = await browser.newPage({ viewport: { width: 390, height: 844 } });
await boot(desktop);
await desktop.screenshot({ path: "/workspace/screenshots/p3-title.png" });
await startPlay(desktop);
await desktop.screenshot({ path: "/workspace/screenshots/p3-play-idle.png" });

const d0 = await desktop.evaluate(() => window.__controlsTest.getX());
await desktop.evaluate(() => window.__controlsTest.setKeys(["KeyD"]));
await desktop.waitForTimeout(2800);
const walked = await desktop.evaluate(() => ({
  x: window.__controlsTest.getX(),
  y: window.__controlsTest.getY(),
  facing: window.__controlsTest.getFacing(),
  grounded: window.__controlsTest.getGrounded(),
  enemies: window.__controlsTest.getEnemyCount(),
}));
await desktop.screenshot({ path: "/workspace/screenshots/p3-approach.png" });
for (let i = 0; i < 10; i += 1) {
  await desktop.keyboard.press("KeyJ");
  await desktop.waitForTimeout(260);
}
await desktop.waitForTimeout(500);
const after = await desktop.evaluate(() => ({
  x: window.__controlsTest.getX(),
  y: window.__controlsTest.getY(),
  enemies: window.__controlsTest.getEnemyCount(),
  kos: window.__controlsTest.getKos(),
  health: window.__controlsTest.getHealth(),
  grounded: window.__controlsTest.getGrounded(),
}));
await desktop.screenshot({ path: "/workspace/screenshots/p3-combat.png" });
await desktop.evaluate(() => window.__controlsTest.setKeys([]));

await desktop.getByTestId("roster-button").click();
await desktop.getByTestId("fighter-keno").waitFor({ timeout: 5000 });
await desktop.screenshot({ path: "/workspace/screenshots/p3-select.png" });

const wide = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await boot(wide);
await startPlay(wide);
await wide.screenshot({ path: "/workspace/screenshots/p3-desktop-letterbox.png" });

console.log(
  JSON.stringify(
    {
      errors,
      mobile: { x0, left, right },
      walked,
      after,
      aDecreasesX: left.x < x0,
      dIncreasesX: right.x > left.x,
      enemiesPresent: walked.enemies > 0,
      landedHit: after.kos > 0 || after.enemies < walked.enemies || after.health < 110,
    },
    null,
    2,
  ),
);

await browser.close();
