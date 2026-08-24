import { chromium } from "playwright";

const errors = [];
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://127.0.0.1:8080/?qa=4", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(800);
await page.screenshot({ path: "/workspace/screenshots/p2-title.png" });

await page.getByRole("button", { name: /choose fighter/i }).click();
await page.getByTestId("confirm-fighter").waitFor({ timeout: 5000 });
await page.waitForTimeout(250);
await page.screenshot({ path: "/workspace/screenshots/p2-select.png" });

const gen0 = await page.evaluate(() => window.__playGeneration || 0);
await page.evaluate(() => document.querySelector("[data-testid='confirm-fighter']")?.click());
await page.getByTestId("hud").waitFor({ timeout: 8000 });
await page.waitForFunction((g) => (window.__playGeneration || 0) > g, gen0, { timeout: 8000 });
await page.waitForFunction(
  () => window.__controlsTest && window.__controlsTest.getGrounded(),
  null,
  { timeout: 8000 },
);
await page.waitForTimeout(250);
await page.screenshot({ path: "/workspace/screenshots/p2-jav-idle.png" });

const x0 = await page.evaluate(() => window.__controlsTest.getX());
await page.evaluate(() => window.__controlsTest.setKeys(["KeyD"]));
await page.waitForTimeout(200);
const mid = await page.evaluate(() => ({
  x: window.__controlsTest.getX(),
  vx: window.__controlsTest.getSpeed(),
  moveX: window.__controlsTest.getMoveX(),
  enabled: window.__controlsTest.getEnabled(),
  facing: window.__controlsTest.getFacing(),
}));
await page.waitForTimeout(500);
const d = await page.evaluate(() => ({
  x: window.__controlsTest.getX(),
  facing: window.__controlsTest.getFacing(),
  grounded: window.__controlsTest.getGrounded(),
  vx: window.__controlsTest.getSpeed(),
  moveX: window.__controlsTest.getMoveX(),
  enabled: window.__controlsTest.getEnabled(),
  gen: window.__playGeneration,
}));
await page.screenshot({ path: "/workspace/screenshots/p2-jav-right.png" });
await page.evaluate(() => window.__controlsTest.setKeys(["KeyA"]));
await page.waitForTimeout(700);
const a = await page.evaluate(() => ({
  x: window.__controlsTest.getX(),
  facing: window.__controlsTest.getFacing(),
  grounded: window.__controlsTest.getGrounded(),
  vx: window.__controlsTest.getSpeed(),
  moveX: window.__controlsTest.getMoveX(),
}));
await page.screenshot({ path: "/workspace/screenshots/p2-jav-left.png" });
await page.evaluate(() => window.__controlsTest.setKeys([]));
await page.keyboard.press("KeyJ");
await page.waitForTimeout(200);
await page.screenshot({ path: "/workspace/screenshots/p2-jav-attack.png" });
await page.keyboard.press("KeyK");
await page.waitForTimeout(240);
await page.screenshot({ path: "/workspace/screenshots/p2-jav-special.png" });

const hudName = await page.locator("[data-testid='hud']").innerText();

await page.getByTestId("roster-button").click();
await page.getByTestId("fighter-keno").waitFor({ timeout: 5000 });
const gen1 = await page.evaluate(() => window.__playGeneration || 0);
await page.evaluate(() => document.querySelector("[data-testid='fighter-keno']")?.click());
await page.waitForTimeout(150);
await page.evaluate(() => document.querySelector("[data-testid='confirm-fighter']")?.click());
await page.getByTestId("hud").waitFor({ timeout: 8000 });
await page.waitForFunction((g) => (window.__playGeneration || 0) > g, gen1, { timeout: 8000 });
await page.waitForFunction(
  () => window.__controlsTest && window.__controlsTest.getGrounded(),
  null,
  { timeout: 8000 },
);
await page.waitForTimeout(200);
await page.screenshot({ path: "/workspace/screenshots/p2-keno-idle.png" });
await page.keyboard.press("KeyJ");
await page.waitForTimeout(200);
await page.screenshot({ path: "/workspace/screenshots/p2-keno-attack.png" });
const kenoHud = await page.locator("[data-testid='hud']").innerText();

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
});
await mobile.goto("http://127.0.0.1:8080/?qa=4", { waitUntil: "networkidle", timeout: 30000 });
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: "/workspace/screenshots/p2-mobile-title.png" });
await mobile.getByRole("button", { name: /choose fighter/i }).click();
await mobile.getByTestId("confirm-fighter").waitFor({ timeout: 5000 });
await mobile.waitForTimeout(250);
await mobile.screenshot({ path: "/workspace/screenshots/p2-mobile-select.png" });

console.log(
  JSON.stringify(
    {
      gen0,
      x0,
      mid,
      d,
      a,
      dMovedRight: d.x > x0 + 40 && d.facing === 1,
      aMovedLeft: a.x < d.x - 40 && a.facing === -1,
      hudName: hudName.slice(0, 160),
      kenoHud: kenoHud.slice(0, 160),
      errors,
    },
    null,
    2,
  ),
);
await browser.close();
