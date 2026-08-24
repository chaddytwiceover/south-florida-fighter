import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const brain = "C:/Users/thech/.gemini/antigravity/brain/ae9314ef-0040-40e6-8399-0ca11851c744";

/**
 * Chroma-key removal for white/light gray backgrounds or fake checkerboard
 */
async function removeBackgroundAndNormalize(
  inputPath,
  outputPath,
  targetFrameWidth = 160,
  targetFrameHeight = 180,
  frameCount = 4,
) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const outputBuffer = Buffer.from(data);

  // Chroma-key algorithm: remove near-white and checkerboard gray pixels
  for (let i = 0; i < outputBuffer.length; i += channels) {
    const r = outputBuffer[i];
    const g = outputBuffer[i + 1];
    const b = outputBuffer[i + 2];

    // Check if pixel is white, off-white, light gray, or light checkerboard pattern
    const isWhite = r > 230 && g > 230 && b > 230;
    const isLightGray = Math.abs(r - g) < 12 && Math.abs(g - b) < 12 && r > 180 && g > 180 && b > 180;
    const isMediumGrayChecker = Math.abs(r - g) < 8 && Math.abs(g - b) < 8 && r >= 115 && r <= 155;

    // Outer border background
    if (isWhite || isLightGray || isMediumGrayChecker) {
      outputBuffer[i + 3] = 0; // Alpha to 0
    }
  }

  // Save the cleaned transparent PNG
  const totalTargetWidth = targetFrameWidth * frameCount;

  await sharp(outputBuffer, {
    raw: { width, height, channels },
  })
    .resize(totalTargetWidth, targetFrameHeight, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outputPath);

  console.log(`Processed: ${outputPath} (${totalTargetWidth}x${targetFrameHeight})`);
}

async function processAll() {
  const javDir = "public/game/sprites/characters/jav";
  const bruiserDir = "public/game/sprites/enemies/bruiser";
  const bladeDir = "public/game/sprites/enemies/blade";
  const bossDir = "public/game/sprites/enemies/boss";

  fs.mkdirSync(javDir, { recursive: true });
  fs.mkdirSync(bruiserDir, { recursive: true });
  fs.mkdirSync(bladeDir, { recursive: true });
  fs.mkdirSync(bossDir, { recursive: true });

  const idleSrc = path.join(brain, "jav_sprites_idle_1787545626215.jpg");
  const attackSrc = path.join(brain, "jav_sprites_attack_1787545651299.jpg");
  const specialSrc = path.join(brain, "jav_sprites_special_1787545667339.jpg");
  const bruiserSrc = path.join(brain, "enemy_bruiser_sprites_1787546626362.jpg");
  const bladeSrc = path.join(brain, "enemy_blade_sprites_1787546648853.jpg");
  const bossSrc = path.join(brain, "enemy_boss_sprites_1787546676464.jpg");

  // Process JAV sheets (160x180 per frame, 640x180 total)
  await removeBackgroundAndNormalize(idleSrc, path.join(javDir, "idle.png"), 160, 180);
  await removeBackgroundAndNormalize(idleSrc, path.join(javDir, "run.png"), 160, 180);
  await removeBackgroundAndNormalize(idleSrc, path.join(javDir, "jump.png"), 160, 180);

  await removeBackgroundAndNormalize(attackSrc, path.join(javDir, "light.png"), 160, 180);
  await removeBackgroundAndNormalize(attackSrc, path.join(javDir, "heavy.png"), 160, 180);
  await removeBackgroundAndNormalize(attackSrc, path.join(javDir, "kick.png"), 160, 180);
  await removeBackgroundAndNormalize(attackSrc, path.join(javDir, "special1.png"), 160, 180);
  await removeBackgroundAndNormalize(attackSrc, path.join(javDir, "hurt.png"), 160, 180);

  await removeBackgroundAndNormalize(specialSrc, path.join(javDir, "special2.png"), 160, 180);
  await removeBackgroundAndNormalize(specialSrc, path.join(javDir, "special3.png"), 160, 180);
  await removeBackgroundAndNormalize(specialSrc, path.join(javDir, "finisher.png"), 160, 180);

  // Process Enemy sheets (160x180 per frame)
  for (const act of ["idle", "run", "attack", "hurt"]) {
    await removeBackgroundAndNormalize(bruiserSrc, path.join(bruiserDir, `${act}.png`), 160, 180);
    await removeBackgroundAndNormalize(bladeSrc, path.join(bladeDir, `${act}.png`), 160, 180);
    await removeBackgroundAndNormalize(bossSrc, path.join(bossDir, `${act}.png`), 180, 200);
  }

  // Also copy to legacy thug/rat dirs just in case
  const thugDir = "public/game/sprites/enemies/thug";
  const ratDir = "public/game/sprites/enemies/rat";
  fs.mkdirSync(thugDir, { recursive: true });
  fs.mkdirSync(ratDir, { recursive: true });
  for (const act of ["idle", "run", "attack", "hurt"]) {
    fs.copyFileSync(path.join(bruiserDir, `${act}.png`), path.join(thugDir, `${act}.png`));
    fs.copyFileSync(path.join(bladeDir, `${act}.png`), path.join(ratDir, `${act}.png`));
  }

  console.log("ALL SPRITES CLEANED, TRANSPARENT, AND NORMALIZED!");
}

processAll().catch(console.error);
