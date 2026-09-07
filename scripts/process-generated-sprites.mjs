import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * South Florida Fighter - Generated Sprite Processor
 * Extracts bespoke sprite sheets for JAV, Bruiser, Blade, and Boss.
 * Uses exterior flood-fill alpha extraction for zero color bleed or internal hollowing.
 */

function isMagenta(r, g, b) {
  // Flat magenta backdrop check
  return r > 150 && b > 150 && g < 110 && (r + b) - 2 * g > 120;
}

function floodFillAlpha(rawBuffer, width, height, channels) {
  const data = Buffer.from(rawBuffer); // clone
  const visited = new Uint8Array(width * height);
  const queue = [];

  function checkAndPush(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;

    const p = idx * channels;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];

    if (isMagenta(r, g, b)) {
      data[p + 3] = 0; // Transparent
      queue.push(idx);
    }
  }

  // Seed outer border
  for (let x = 0; x < width; x++) {
    checkAndPush(x, 0);
    checkAndPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    checkAndPush(0, y);
    checkAndPush(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cy = Math.floor(curr / width);
    const cx = curr % width;

    const neighbors = [
      [cx - 1, cy],
      [cx + 1, cy],
      [cx, cy - 1],
      [cx, cy + 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nidx = ny * width + nx;
        if (!visited[nidx]) {
          visited[nidx] = 1;
          const p = nidx * channels;
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];
          if (isMagenta(r, g, b)) {
            data[p + 3] = 0;
            queue.push(nidx);
          }
        }
      }
    }
  }

  return data;
}

/**
 * Extracts a rectangular sub-region, trims alpha boundaries, and places it centered & bottom-aligned on target canvas.
 */
async function extractSprite(fullRgba, fullWidth, fullHeight, cropX, cropY, cropW, cropH, targetW, targetH) {
  // Clamp extraction coordinates to source image dimensions
  const safeLeft = Math.max(0, Math.min(cropX, fullWidth - 1));
  const safeTop = Math.max(0, Math.min(cropY, fullHeight - 1));
  const safeWidth = Math.max(1, Math.min(cropW, fullWidth - safeLeft));
  const safeHeight = Math.max(1, Math.min(cropH, fullHeight - safeTop));

  // Extract sub-region
  const sub = await sharp(fullRgba, {
    raw: { width: fullWidth, height: fullHeight, channels: 4 }
  })
    .extract({ left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = sub;
  const sw = info.width;
  const sh = info.height;

  // Find non-transparent bounds
  let minX = sw, maxX = -1, minY = sh, maxY = -1;
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const idx = (y * sw + x) * 4;
      const alpha = data[idx + 3];
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Secondary cleanup for any edge magenta fringes
      if (isMagenta(r, g, b)) {
        data[idx + 3] = 0;
        continue;
      }

      if (alpha > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    // Empty frame fallback
    return sharp({
      create: { width: targetW, height: targetH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    }).png().toBuffer();
  }

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;

  // Crop to actual character content
  const cropped = await sharp(data, {
    raw: { width: sw, height: sh, channels: 4 }
  })
    .extract({ left: minX, top: minY, width: bw, height: bh })
    .png()
    .toBuffer();

  // Determine scale to fit comfortably in target box (~80-85% of target height)
  const maxAllowedH = Math.round(targetH * 0.88);
  const maxAllowedW = Math.round(targetW * 0.90);
  let scale = 1;
  if (bh > maxAllowedH || bw > maxAllowedW) {
    scale = Math.min(maxAllowedH / bh, maxAllowedW / bw);
  }

  const finalW = Math.round(bw * scale);
  const finalH = Math.round(bh * scale);

  const resized = await sharp(cropped)
    .resize(finalW, finalH, { kernel: "nearest" })
    .toBuffer();

  // Position: horizontally centered, bottom-anchored with 4px floor padding
  const destX = Math.round((targetW - finalW) / 2);
  const destY = targetH - finalH - 4;

  return sharp({
    create: {
      width: targetW,
      height: targetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resized, left: Math.max(0, destX), top: Math.max(0, destY) }])
    .png()
    .toBuffer();
}

/**
 * Combines an array of frame buffers into one horizontal sprite sheet.
 */
async function packHorizontalStrip(frameBuffers, targetW, targetH) {
  const count = frameBuffers.length;
  const totalW = targetW * count;
  const composites = frameBuffers.map((buf, i) => ({
    input: buf,
    left: i * targetW,
    top: 0
  }));

  return sharp({
    create: {
      width: totalW,
      height: targetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(composites)
    .png()
    .toBuffer();
}

async function processAll() {
  console.log("Starting South Florida Fighter sprite processing pipeline...");

  // ==========================================
  // 1. JAV (Player)
  // ==========================================
  console.log("\n[1/4] Processing JAV...");
  const javPath = "C:/Users/thech/.gemini/antigravity/brain/4905053d-9d77-401c-8cbd-943a9ed1d0ba/jav_magenta_spritesheet_1788581806079.jpg";
  const javMeta = await sharp(javPath).metadata();
  const javRaw = await sharp(javPath).ensureAlpha().raw().toBuffer();
  const javClean = floodFillAlpha(javRaw, javMeta.width, javMeta.height, 4);

  const TW = 160, TH = 180;
  const javOutDir = "public/game/sprites/characters/jav";
  await fs.mkdir(javOutDir, { recursive: true });

  // JAV Idle: Row 1 (5 frames)
  const javIdleBoxes = [
    { x: 50, y: 45, w: 140, h: 175 },
    { x: 195, y: 45, w: 140, h: 175 },
    { x: 340, y: 45, w: 135, h: 175 },
    { x: 475, y: 45, w: 130, h: 175 },
  ];
  const javIdleFrames = [];
  for (const b of javIdleBoxes) {
    javIdleFrames.push(await extractSprite(javClean, javMeta.width, javMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(javOutDir, "idle.png"), await packHorizontalStrip(javIdleFrames, TW, TH));
  console.log("  ✓ JAV idle.png (4 frames)");

  // JAV Run: Row 2 (6 frames)
  const javRunBoxes = [
    { x: 45, y: 220, w: 145, h: 180 },
    { x: 200, y: 220, w: 145, h: 180 },
    { x: 350, y: 220, w: 145, h: 180 },
    { x: 500, y: 220, w: 135, h: 180 },
    { x: 640, y: 220, w: 150, h: 180 },
    { x: 800, y: 220, w: 150, h: 180 },
  ];
  const javRunFrames = [];
  for (const b of javRunBoxes) {
    javRunFrames.push(await extractSprite(javClean, javMeta.width, javMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  // Also create a 4-frame standard run strip for compatibility
  const javRun4 = [javRunFrames[0], javRunFrames[2], javRunFrames[4], javRunFrames[5]];
  await fs.writeFile(path.join(javOutDir, "run.png"), await packHorizontalStrip(javRun4, TW, TH));
  await fs.writeFile(path.join(javOutDir, "run-8frame.png"), await packHorizontalStrip(javRunFrames, TW, TH));
  console.log("  ✓ JAV run.png (4 frames) & run-8frame.png (6 frames)");

  // JAV Attacks: Row 3
  // Light: Jabs (frames 1 & 2 of row 3)
  const javLightBoxes = [
    { x: 50, y: 45, w: 140, h: 175 }, // windup
    { x: 30, y: 405, w: 155, h: 180 }, // jab 1
    { x: 170, y: 405, w: 160, h: 180 }, // jab 2
    { x: 310, y: 405, w: 170, h: 180 }, // punch extended
  ];
  const javLightFrames = [];
  for (const b of javLightBoxes) {
    javLightFrames.push(await extractSprite(javClean, javMeta.width, javMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(javOutDir, "light.png"), await packHorizontalStrip(javLightFrames, TW, TH));
  console.log("  ✓ JAV light.png (4 frames)");

  // Heavy: Big punch with recovery
  const javHeavyBoxes = [
    { x: 195, y: 45, w: 140, h: 175 },
    { x: 310, y: 405, w: 170, h: 180 },
    { x: 1060, y: 405, w: 135, h: 180 },
    { x: 1205, y: 405, w: 135, h: 180 },
  ];
  const javHeavyFrames = [];
  for (const b of javHeavyBoxes) {
    javHeavyFrames.push(await extractSprite(javClean, javMeta.width, javMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(javOutDir, "heavy.png"), await packHorizontalStrip(javHeavyFrames, TW, TH));
  console.log("  ✓ JAV heavy.png (4 frames)");

  // Kick: Chambered kick, extended kick, recovery
  const javKickBoxes = [
    { x: 565, y: 400, w: 140, h: 185 }, // chambered
    { x: 705, y: 400, w: 190, h: 185 }, // extended kick
    { x: 900, y: 400, w: 165, h: 185 }, // mid recovery
    { x: 1060, y: 405, w: 135, h: 180 }, // reset
  ];
  const javKickFrames = [];
  for (const b of javKickBoxes) {
    javKickFrames.push(await extractSprite(javClean, javMeta.width, javMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(javOutDir, "kick.png"), await packHorizontalStrip(javKickFrames, TW, TH));
  console.log("  ✓ JAV kick.png (4 frames)");

  // Jump: takeoff, apex, fall, land
  const javJumpBoxes = [
    { x: 500, y: 220, w: 135, h: 180 }, // launch
    { x: 640, y: 220, w: 150, h: 180 }, // apex
    { x: 800, y: 220, w: 150, h: 180 }, // descent
    { x: 50, y: 45, w: 140, h: 175 },   // land
  ];
  const javJumpFrames = [];
  for (const b of javJumpBoxes) {
    javJumpFrames.push(await extractSprite(javClean, javMeta.width, javMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(javOutDir, "jump.png"), await packHorizontalStrip(javJumpFrames, TW, TH));
  console.log("  ✓ JAV jump.png (4 frames)");

  // Hurt: Row 4
  const javHurtBoxes = [
    { x: 45, y: 585, w: 165, h: 180 },
    { x: 205, y: 590, w: 175, h: 175 },
    { x: 375, y: 585, w: 150, h: 180 },
    { x: 535, y: 585, w: 135, h: 180 },
  ];
  const javHurtFrames = [];
  for (const b of javHurtBoxes) {
    javHurtFrames.push(await extractSprite(javClean, javMeta.width, javMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(javOutDir, "hurt.png"), await packHorizontalStrip(javHurtFrames, TW, TH));
  console.log("  ✓ JAV hurt.png (4 frames)");

  // Specials: Combinations of punches and high kicks
  await fs.writeFile(path.join(javOutDir, "special1.png"), await packHorizontalStrip([javLightFrames[1], javHeavyFrames[1], javKickFrames[1], javKickFrames[2]], TW, TH));
  await fs.writeFile(path.join(javOutDir, "special2.png"), await packHorizontalStrip([javKickFrames[0], javKickFrames[1], javHeavyFrames[1], javLightFrames[3]], TW, TH));
  await fs.writeFile(path.join(javOutDir, "special3.png"), await packHorizontalStrip([javLightFrames[0], javLightFrames[2], javKickFrames[1], javHeavyFrames[1]], TW, TH));
  await fs.writeFile(path.join(javOutDir, "finisher.png"), await packHorizontalStrip([javHeavyFrames[0], javHeavyFrames[1], javKickFrames[1], javLightFrames[3]], TW, TH));
  console.log("  ✓ JAV special1-3.png & finisher.png");

  // High-Res JAV Portrait for UI
  const javPortrait = await sharp(javClean, { raw: { width: javMeta.width, height: javMeta.height, channels: 4 } })
    .extract({ left: 55, top: 48, width: 120, height: 160 })
    .resize(256, 256, { fit: "cover" })
    .png()
    .toBuffer();
  await fs.writeFile(path.join(javOutDir, "portrait.png"), javPortrait);
  console.log("  ✓ JAV portrait.png");

  // ==========================================
  // 2. BRUISER (Boardwalk Bruiser)
  // ==========================================
  console.log("\n[2/4] Processing Boardwalk Bruiser...");
  const bruiserPath = "C:/Users/thech/.gemini/antigravity/brain/4905053d-9d77-401c-8cbd-943a9ed1d0ba/bruiser_spritesheet_test_1788581759624.jpg";
  const bruiserMeta = await sharp(bruiserPath).metadata();
  const bruiserRaw = await sharp(bruiserPath).ensureAlpha().raw().toBuffer();
  const bruiserClean = floodFillAlpha(bruiserRaw, bruiserMeta.width, bruiserMeta.height, 4);

  const bruiserOutDir = "public/game/sprites/enemies/bruiser";
  await fs.mkdir(bruiserOutDir, { recursive: true });

  // Bruiser Grid: 4 columns
  // Col 1: Idle (rows 1-4)
  const bruiserIdleBoxes = [
    { x: 30, y: 70, w: 180, h: 165 },
    { x: 30, y: 235, w: 180, h: 165 },
    { x: 30, y: 405, w: 180, h: 165 },
    { x: 30, y: 575, w: 180, h: 165 },
  ];
  const bruiserIdle = [];
  for (const b of bruiserIdleBoxes) {
    bruiserIdle.push(await extractSprite(bruiserClean, bruiserMeta.width, bruiserMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(bruiserOutDir, "idle.png"), await packHorizontalStrip(bruiserIdle, TW, TH));
  console.log("  ✓ Bruiser idle.png (4 frames)");

  // Col 2: Run (rows 1-4, left runner)
  const bruiserRunBoxes = [
    { x: 215, y: 70, w: 165, h: 165 },
    { x: 360, y: 70, w: 165, h: 165 },
    { x: 215, y: 235, w: 165, h: 165 },
    { x: 360, y: 235, w: 165, h: 165 },
  ];
  const bruiserRun = [];
  for (const b of bruiserRunBoxes) {
    bruiserRun.push(await extractSprite(bruiserClean, bruiserMeta.width, bruiserMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(bruiserOutDir, "run.png"), await packHorizontalStrip(bruiserRun, TW, TH));
  console.log("  ✓ Bruiser run.png (4 frames)");

  // Col 3: Attack (rows 1-4)
  const bruiserAtkBoxes = [
    { x: 520, y: 70, w: 230, h: 165 },
    { x: 520, y: 235, w: 230, h: 165 },
    { x: 535, y: 405, w: 240, h: 165 },
    { x: 540, y: 575, w: 235, h: 165 },
  ];
  const bruiserAtk = [];
  for (const b of bruiserAtkBoxes) {
    bruiserAtk.push(await extractSprite(bruiserClean, bruiserMeta.width, bruiserMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(bruiserOutDir, "attack.png"), await packHorizontalStrip(bruiserAtk, TW, TH));
  console.log("  ✓ Bruiser attack.png (4 frames)");

  // Col 4: Hurt (rows 1-4)
  const bruiserHurtBoxes = [
    { x: 790, y: 70, w: 220, h: 165 },
    { x: 790, y: 235, w: 220, h: 165 },
    { x: 790, y: 405, w: 220, h: 165 },
    { x: 790, y: 575, w: 220, h: 165 },
  ];
  const bruiserHurt = [];
  for (const b of bruiserHurtBoxes) {
    bruiserHurt.push(await extractSprite(bruiserClean, bruiserMeta.width, bruiserMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(bruiserOutDir, "hurt.png"), await packHorizontalStrip(bruiserHurt, TW, TH));
  console.log("  ✓ Bruiser hurt.png (4 frames)");

  // ==========================================
  // 3. BLADE (Ybor Blade)
  // ==========================================
  console.log("\n[3/4] Processing Ybor Blade...");
  const bladePath = "C:/Users/thech/.gemini/antigravity/brain/4905053d-9d77-401c-8cbd-943a9ed1d0ba/blade_spritesheet_test_1788581774724.jpg";
  const bladeMeta = await sharp(bladePath).metadata();
  const bladeRaw = await sharp(bladePath).ensureAlpha().raw().toBuffer();
  const bladeClean = floodFillAlpha(bladeRaw, bladeMeta.width, bladeMeta.height, 4);

  const bladeOutDir = "public/game/sprites/enemies/blade";
  await fs.mkdir(bladeOutDir, { recursive: true });

  // Blade Grid: 4 columns
  // Col 1: Idle (4 frames)
  const bladeIdleBoxes = [
    { x: 35, y: 125, w: 135, h: 160 },
    { x: 175, y: 125, w: 135, h: 160 },
    { x: 35, y: 285, w: 135, h: 160 },
    { x: 175, y: 285, w: 135, h: 160 },
  ];
  const bladeIdle = [];
  for (const b of bladeIdleBoxes) {
    bladeIdle.push(await extractSprite(bladeClean, bladeMeta.width, bladeMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(bladeOutDir, "idle.png"), await packHorizontalStrip(bladeIdle, TW, TH));
  console.log("  ✓ Blade idle.png (4 frames)");

  // Col 2: Run (4 frames)
  const bladeRunBoxes = [
    { x: 365, y: 125, w: 145, h: 160 },
    { x: 515, y: 125, w: 145, h: 160 },
    { x: 365, y: 285, w: 145, h: 160 },
    { x: 515, y: 285, w: 145, h: 160 },
  ];
  const bladeRun = [];
  for (const b of bladeRunBoxes) {
    bladeRun.push(await extractSprite(bladeClean, bladeMeta.width, bladeMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(bladeOutDir, "run.png"), await packHorizontalStrip(bladeRun, TW, TH));
  console.log("  ✓ Blade run.png (4 frames)");

  // Col 3: Slash Attack (4 frames)
  const bladeAtkBoxes = [
    { x: 730, y: 125, w: 160, h: 160 },
    { x: 875, y: 125, w: 175, h: 160 },
    { x: 730, y: 285, w: 160, h: 160 },
    { x: 875, y: 285, w: 175, h: 160 },
  ];
  const bladeAtk = [];
  for (const b of bladeAtkBoxes) {
    bladeAtk.push(await extractSprite(bladeClean, bladeMeta.width, bladeMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(bladeOutDir, "attack.png"), await packHorizontalStrip(bladeAtk, TW, TH));
  console.log("  ✓ Blade attack.png (4 frames)");

  // Col 4: Hurt (4 frames)
  const bladeHurtBoxes = [
    { x: 1150, y: 120, w: 155, h: 165 },
    { x: 1150, y: 285, w: 155, h: 165 },
    { x: 1150, y: 445, w: 155, h: 165 },
    { x: 1150, y: 605, w: 155, h: 165 },
  ];
  const bladeHurt = [];
  for (const b of bladeHurtBoxes) {
    bladeHurt.push(await extractSprite(bladeClean, bladeMeta.width, bladeMeta.height, b.x, b.y, b.w, b.h, TW, TH));
  }
  await fs.writeFile(path.join(bladeOutDir, "hurt.png"), await packHorizontalStrip(bladeHurt, TW, TH));
  console.log("  ✓ Blade hurt.png (4 frames)");

  // ==========================================
  // 4. BOSS (Syndicate Boss)
  // ==========================================
  console.log("\n[4/4] Processing Syndicate Boss...");
  const bossPath = "C:/Users/thech/.gemini/antigravity/brain/4905053d-9d77-401c-8cbd-943a9ed1d0ba/boss_spritesheet_test_1788581789129.jpg";
  const bossMeta = await sharp(bossPath).metadata();
  const bossRaw = await sharp(bossPath).ensureAlpha().raw().toBuffer();
  const bossClean = floodFillAlpha(bossRaw, bossMeta.width, bossMeta.height, 4);

  const BTW = 180, BTH = 200;
  const bossOutDir = "public/game/sprites/enemies/boss";
  await fs.mkdir(bossOutDir, { recursive: true });

  // Boss Idle: Menacing aura (Col 1 & 2, rows 1-4)
  const bossIdleBoxes = [
    { x: 20, y: 65, w: 125, h: 160 },
    { x: 155, y: 65, w: 115, h: 160 },
    { x: 20, y: 215, w: 125, h: 180 },
    { x: 155, y: 215, w: 115, h: 180 },
  ];
  const bossIdle = [];
  for (const b of bossIdleBoxes) {
    bossIdle.push(await extractSprite(bossClean, bossMeta.width, bossMeta.height, b.x, b.y, b.w, b.h, BTW, BTH));
  }
  await fs.writeFile(path.join(bossOutDir, "idle.png"), await packHorizontalStrip(bossIdle, BTW, BTH));
  console.log("  ✓ Boss idle.png (4 frames)");

  // Boss Walk: Steady advance (Col 3, rows 1-4)
  const bossWalkBoxes = [
    { x: 425, y: 65, w: 115, h: 160 },
    { x: 540, y: 65, w: 115, h: 160 },
    { x: 425, y: 220, w: 115, h: 175 },
    { x: 540, y: 220, w: 115, h: 175 },
  ];
  const bossRun = [];
  for (const b of bossWalkBoxes) {
    bossRun.push(await extractSprite(bossClean, bossMeta.width, bossMeta.height, b.x, b.y, b.w, b.h, BTW, BTH));
  }
  await fs.writeFile(path.join(bossOutDir, "run.png"), await packHorizontalStrip(bossRun, BTW, BTH));
  console.log("  ✓ Boss run.png (4 frames)");

  // Boss Attack: Massive Energy Power Punch (Col 4, rows 1-4)
  const bossAtkBoxes = [
    { x: 680, y: 65, w: 155, h: 160 },  // charge
    { x: 815, y: 65, w: 170, h: 160 },  // punch
    { x: 680, y: 225, w: 155, h: 170 }, // energy gather
    { x: 815, y: 220, w: 290, h: 175 }, // massive energy blast beam
  ];
  const bossAtk = [];
  for (const b of bossAtkBoxes) {
    bossAtk.push(await extractSprite(bossClean, bossMeta.width, bossMeta.height, b.x, b.y, b.w, b.h, BTW, BTH));
  }
  await fs.writeFile(path.join(bossOutDir, "attack.png"), await packHorizontalStrip(bossAtk, BTW, BTH));
  console.log("  ✓ Boss attack.png (4 frames)");

  // Boss Hurt: Stagger (Col 5, rows 1-4)
  const bossHurtBoxes = [
    { x: 1125, y: 65, w: 115, h: 160 },
    { x: 1235, y: 65, w: 115, h: 160 },
    { x: 1120, y: 225, w: 115, h: 170 },
    { x: 1230, y: 225, w: 115, h: 170 },
  ];
  const bossHurt = [];
  for (const b of bossHurtBoxes) {
    bossHurt.push(await extractSprite(bossClean, bossMeta.width, bossMeta.height, b.x, b.y, b.w, b.h, BTW, BTH));
  }
  await fs.writeFile(path.join(bossOutDir, "hurt.png"), await packHorizontalStrip(bossHurt, BTW, BTH));
  console.log("  ✓ Boss hurt.png (4 frames)");

  console.log("\nAll custom sprites extracted and packaged successfully!");
}

processAll().catch(err => {
  console.error("Sprite processing failed:", err);
  process.exit(1);
});
