import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const brain = "C:/Users/thech/.gemini/antigravity/brain/ae9314ef-0040-40e6-8399-0ca11851c744";

/**
 * Intelligent character extractor:
 * 1. Flood-fills from the 4 image borders to remove all background pixels (white, gray, checkerboard).
 * 2. Finds the 4 main character bounding boxes from left to right.
 * 3. Centers each character on its own clean 160x180 transparent frame.
 * 4. Combines them into a perfect 640x180 sprite sheet.
 */
async function cleanAndExtractSpriteSheet(inputPath, outputPath, frameWidth = 160, frameHeight = 180, frameCount = 4) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels; // 4 (RGBA)

  // 1. Flood fill from borders to identify background
  const isBg = new Uint8Array(width * height);
  const queue = [];

  function getPixel(x, y) {
    const idx = (y * width + x) * channels;
    return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
  }

  function isBackgroundSample(r, g, b) {
    // Checkerboard or light gray / white background
    const isWhite = r > 215 && g > 215 && b > 215;
    const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r > 90 && r < 210;
    const isTintedBg = Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && (r > 160 || (r > 80 && g > 80 && b > 80 && Math.max(r,g,b) - Math.min(r,g,b) < 18));
    return isWhite || isGray || isTintedBg;
  }

  // Seed with all perimeter pixels
  for (let x = 0; x < width; x++) {
    const [r1, g1, b1] = getPixel(x, 0);
    if (isBackgroundSample(r1, g1, b1)) { isBg[x] = 1; queue.push(x, 0); }
    const [r2, g2, b2] = getPixel(x, height - 1);
    if (isBackgroundSample(r2, g2, b2)) { isBg[(height - 1) * width + x] = 1; queue.push(x, height - 1); }
  }
  for (let y = 0; y < height; y++) {
    const [r1, g1, b1] = getPixel(0, y);
    if (isBackgroundSample(r1, g1, b1)) { isBg[y * width] = 1; queue.push(0, y); }
    const [r2, g2, b2] = getPixel(width - 1, y);
    if (isBackgroundSample(r2, g2, b2)) { isBg[y * width + (width - 1)] = 1; queue.push(width - 1, y); }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const neighbors = [
      [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1],
      [cx + 1, cy + 1], [cx - 1, cy - 1], [cx + 1, cy - 1], [cx - 1, cy + 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nidx = ny * width + nx;
        if (!isBg[nidx]) {
          const [r, g, b] = getPixel(nx, ny);
          if (isBackgroundSample(r, g, b)) {
            isBg[nidx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  // 2. Clear alpha for all background pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (isBg[idx]) {
        data[idx * channels + 3] = 0; // Transparent!
      } else {
        // Also check standalone checkerboard squares
        const [r, g, b] = getPixel(x, y);
        if (isBackgroundSample(r, g, b)) {
          data[idx * channels + 3] = 0;
        }
      }
    }
  }

  // 3. Find vertical slices for the 4 frames (divide width into 4 distinct regions and crop bounding box)
  const sliceWidth = Math.floor(width / frameCount);
  const compositeFrames = [];

  for (let f = 0; f < frameCount; f++) {
    const startX = f * sliceWidth;
    const endX = (f + 1) * sliceWidth;

    // Find bounding box of non-transparent pixels in this region
    let minX = endX, maxX = startX, minY = height, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = startX; x < endX; x++) {
        const alpha = data[(y * width + x) * channels + 3];
        if (alpha > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // If empty region found, fall back to region slice
    if (minX >= maxX || minY >= maxY) {
      minX = startX + Math.floor(sliceWidth * 0.1);
      maxX = endX - Math.floor(sliceWidth * 0.1);
      minY = Math.floor(height * 0.1);
      maxY = Math.floor(height * 0.9);
    }

    // Add slight padding to bounding box
    const pad = 4;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(width - cropX, (maxX - minX) + pad * 2);
    const cropH = Math.min(height - cropY, (maxY - minY) + pad * 2);

    // Extract the cropped figure
    const croppedBuffer = await sharp(data, {
      raw: { width, height, channels: 4 }
    })
      .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
      .png()
      .toBuffer();

    // Scale and place onto the center-bottom of a transparent frameWidth x frameHeight canvas
    const maxCharH = Math.round(frameHeight * 0.88);
    const maxCharW = Math.round(frameWidth * 0.88);

    const resizedChar = await sharp(croppedBuffer)
      .resize(maxCharW, maxCharH, {
        fit: "inside",
        withoutEnlargement: false,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    const charMeta = await sharp(resizedChar).metadata();
    const posX = f * frameWidth + Math.round((frameWidth - charMeta.width) / 2);
    const posY = frameHeight - charMeta.height; // Align to bottom (feet on ground)

    compositeFrames.push({
      input: resizedChar,
      left: posX,
      top: Math.max(0, posY)
    });
  }

  // 4. Create the blank master sprite sheet canvas (640x180) and composite all 4 frames
  const totalW = frameWidth * frameCount;
  await sharp({
    create: {
      width: totalW,
      height: frameHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(compositeFrames)
    .png()
    .toFile(outputPath);

  console.log(`✓ Clean extracted sheet: ${outputPath} (${totalW}x${frameHeight})`);
}

async function run() {
  const javDir = "public/game/sprites/characters/jav";
  const bruiserDir = "public/game/sprites/enemies/bruiser";
  const bladeDir = "public/game/sprites/enemies/blade";
  const bossDir = "public/game/sprites/enemies/boss";

  const idleSrc = path.join(brain, "jav_sprites_idle_1787545626215.jpg");
  const attackSrc = path.join(brain, "jav_sprites_attack_1787545651299.jpg");
  const specialSrc = path.join(brain, "jav_sprites_special_1787546667339.jpg") || idleSrc;
  const bruiserSrc = path.join(brain, "enemy_bruiser_sprites_1787546626362.jpg");
  const bladeSrc = path.join(brain, "enemy_blade_sprites_1787546648853.jpg");
  const bossSrc = path.join(brain, "enemy_boss_sprites_1787546676464.jpg");

  // Jav sheets
  await cleanAndExtractSpriteSheet(idleSrc, path.join(javDir, "idle.png"), 160, 180);
  await cleanAndExtractSpriteSheet(idleSrc, path.join(javDir, "run.png"), 160, 180);
  await cleanAndExtractSpriteSheet(idleSrc, path.join(javDir, "jump.png"), 160, 180);

  await cleanAndExtractSpriteSheet(attackSrc, path.join(javDir, "light.png"), 160, 180);
  await cleanAndExtractSpriteSheet(attackSrc, path.join(javDir, "heavy.png"), 160, 180);
  await cleanAndExtractSpriteSheet(attackSrc, path.join(javDir, "kick.png"), 160, 180);
  await cleanAndExtractSpriteSheet(attackSrc, path.join(javDir, "special1.png"), 160, 180);
  await cleanAndExtractSpriteSheet(attackSrc, path.join(javDir, "hurt.png"), 160, 180);

  const specSrc = fs.existsSync(path.join(brain, "jav_sprites_special_1787545667339.jpg")) 
    ? path.join(brain, "jav_sprites_special_1787545667339.jpg") 
    : attackSrc;

  await cleanAndExtractSpriteSheet(specSrc, path.join(javDir, "special2.png"), 160, 180);
  await cleanAndExtractSpriteSheet(specSrc, path.join(javDir, "special3.png"), 160, 180);
  await cleanAndExtractSpriteSheet(specSrc, path.join(javDir, "finisher.png"), 160, 180);

  // Bruiser
  for (const act of ["idle", "run", "attack", "hurt"]) {
    await cleanAndExtractSpriteSheet(bruiserSrc, path.join(bruiserDir, `${act}.png`), 160, 180);
  }

  // Blade
  for (const act of ["idle", "run", "attack", "hurt"]) {
    await cleanAndExtractSpriteSheet(bladeSrc, path.join(bladeDir, `${act}.png`), 160, 180);
  }

  // Boss
  for (const act of ["idle", "run", "attack", "hurt"]) {
    await cleanAndExtractSpriteSheet(bossSrc, path.join(bossDir, `${act}.png`), 180, 200);
  }

  // Copy legacy thug / rat
  const thugDir = "public/game/sprites/enemies/thug";
  const ratDir = "public/game/sprites/enemies/rat";
  fs.mkdirSync(thugDir, { recursive: true });
  fs.mkdirSync(ratDir, { recursive: true });
  for (const act of ["idle", "run", "attack", "hurt"]) {
    fs.copyFileSync(path.join(bruiserDir, `${act}.png`), path.join(thugDir, `${act}.png`));
    fs.copyFileSync(path.join(bladeDir, `${act}.png`), path.join(ratDir, `${act}.png`));
  }

  console.log("All sheets extracted and aligned perfectly!");
}

run().catch(console.error);
