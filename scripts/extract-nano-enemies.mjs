import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * Intelligent Nano Banana Sprite Extractor for South Florida Fighter Enemies
 * Extracts clean, centered, bottom-anchored, true-alpha transparent PNG sheets
 * from the high-resolution AI generated enemy composite sheets.
 */

const BRAIN_DIR = "C:/Users/thech/.gemini/antigravity/brain/ae9314ef-0040-40e6-8399-0ca11851c744";
const OUT_DIR = path.resolve("public/game/sprites/enemies");

const ENEMY_INPUTS = {
  bruiser: path.join(BRAIN_DIR, "enemy_bruiser_hd_1787577525443.jpg"),
  blade: path.join(BRAIN_DIR, "enemy_blade_hd_1787577548284.jpg"),
  boss: path.join(BRAIN_DIR, "enemy_boss_hd_1787577564282.jpg"),
};

function removeBackground(data, width, height, isBlackBg = true) {
  // Flood fill alpha from borders
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isBg(r, g, b) {
    if (isBlackBg) {
      return (r < 32 && g < 32 && b < 32);
    } else {
      // White/gray background
      return (r > 230 && g > 230 && b > 230) || (Math.abs(r - g) < 8 && Math.abs(g - b) < 8 && r > 180);
    }
  }

  function seed(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    const p = idx * 4;
    if (isBg(data[p], data[p + 1], data[p + 2])) {
      data[p + 3] = 0;
      queue.push(idx);
    }
  }

  for (let x = 0; x < width; x++) {
    seed(x, 0);
    seed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    seed(0, y);
    seed(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = ny * width + nx;
          if (!visited[nidx]) {
            visited[nidx] = 1;
            const np = nidx * 4;
            if (isBg(data[np], data[np + 1], data[np + 2])) {
              data[np + 3] = 0;
              queue.push(nidx);
            }
          }
        }
      }
    }
  }
}

function findBoundingBox(data, width, startX, endX, startY, endY) {
  let minX = endX;
  let maxX = startX;
  let minY = endY;
  let maxY = startY;
  let found = false;

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];
      if (a > 30) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found) return null;
  return { minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function extractCharacterFrame(cleanBuffer, bbox, targetFrameW, targetFrameH) {
  if (!bbox || bbox.width < 12 || bbox.height < 12) {
    return sharp({
      create: {
        width: targetFrameW,
        height: targetFrameH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    }).png().toBuffer();
  }

  const cropped = await sharp(cleanBuffer)
    .extract({
      left: bbox.minX,
      top: bbox.minY,
      width: bbox.width,
      height: bbox.height,
    })
    .toBuffer();

  const maxW = targetFrameW * 0.88;
  const maxH = targetFrameH * 0.88;
  const scale = Math.min(maxW / bbox.width, maxH / bbox.height, 1.0);
  const fitW = Math.round(bbox.width * scale);
  const fitH = Math.round(bbox.height * scale);

  const resized = await sharp(cropped)
    .resize(fitW, fitH, { fit: "contain" })
    .toBuffer();

  const destX = Math.round((targetFrameW - fitW) / 2);
  const destY = targetFrameH - fitH - 4; // Bottom anchor

  return sharp({
    create: {
      width: targetFrameW,
      height: targetFrameH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, left: Math.max(0, destX), top: Math.max(0, destY) }])
    .png()
    .toBuffer();
}

async function processBruiser() {
  console.log("Processing Boardwalk Bruiser from Nano Banana generation...");
  const src = ENEMY_INPUTS.bruiser;
  const outDir = path.join(OUT_DIR, "bruiser");
  fs.mkdirSync(outDir, { recursive: true });

  const rawImage = sharp(src);
  const { data, info } = await rawImage.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  removeBackground(data, info.width, info.height, true);

  const cleanBuffer = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();

  const fw = 160;
  const fh = 180;
  const W = info.width;
  const H = info.height;
  const rowH = Math.floor(H / 2);

  // Top Row (5 poses: Run1, Run2, Run3, PunchWindup, PunchActive)
  const topSliceW = Math.floor(W / 5);
  const topFrames = [];
  for (let i = 0; i < 5; i++) {
    const bbox = findBoundingBox(data, W, i * topSliceW, (i + 1) * topSliceW, 0, rowH);
    const buf = await extractCharacterFrame(cleanBuffer, bbox, fw, fh);
    topFrames.push(buf);
  }

  // Bottom Row (4 poses: PunchExtend, PunchFollow, Hurt, Knockdown)
  const botSliceW = Math.floor(W / 4);
  const botFrames = [];
  for (let i = 0; i < 4; i++) {
    const bbox = findBoundingBox(data, W, i * botSliceW, (i + 1) * botSliceW, rowH, H);
    const buf = await extractCharacterFrame(cleanBuffer, bbox, fw, fh);
    botFrames.push(buf);
  }

  // Assemble 4-frame sheets:
  // 1. Idle (Run1, Run2, Run1, Run2)
  await sharp({
    create: { width: fw * 4, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: topFrames[0], left: 0, top: 0 },
      { input: topFrames[1], left: fw, top: 0 },
      { input: topFrames[0], left: fw * 2, top: 0 },
      { input: topFrames[1], left: fw * 3, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, "idle.png"));

  // 2. Run (Run1, Run2, Run3, Run2)
  await sharp({
    create: { width: fw * 4, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: topFrames[0], left: 0, top: 0 },
      { input: topFrames[1], left: fw, top: 0 },
      { input: topFrames[2], left: fw * 2, top: 0 },
      { input: topFrames[1], left: fw * 3, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, "run.png"));

  // 3. Attack (PunchWindup, PunchActive, PunchExtend, PunchFollow)
  await sharp({
    create: { width: fw * 4, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: topFrames[3], left: 0, top: 0 },
      { input: topFrames[4], left: fw, top: 0 },
      { input: botFrames[0], left: fw * 2, top: 0 },
      { input: botFrames[1], left: fw * 3, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, "attack.png"));

  // 4. Hurt (Hurt, Knockdown, Hurt, Run1)
  await sharp({
    create: { width: fw * 4, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: botFrames[2], left: 0, top: 0 },
      { input: botFrames[3], left: fw, top: 0 },
      { input: botFrames[2], left: fw * 2, top: 0 },
      { input: topFrames[0], left: fw * 3, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, "hurt.png"));

  console.log("✓ Boardwalk Bruiser sheets generated!");
}

async function processBlade() {
  console.log("Processing Ybor Blade from Nano Banana generation...");
  const src = ENEMY_INPUTS.blade;
  const outDir = path.join(OUT_DIR, "blade");
  fs.mkdirSync(outDir, { recursive: true });

  const rawImage = sharp(src);
  const { data, info } = await rawImage.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  removeBackground(data, info.width, info.height, false); // White background

  const cleanBuffer = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();

  const fw = 160;
  const fh = 180;
  const W = info.width;
  const H = info.height;
  const rowH = Math.floor(H / 2);

  // Top Row (6 sprint frames)
  const topSliceW = Math.floor(W / 6);
  const topFrames = [];
  for (let i = 0; i < 6; i++) {
    const bbox = findBoundingBox(data, W, i * topSliceW, (i + 1) * topSliceW, 40, rowH);
    const buf = await extractCharacterFrame(cleanBuffer, bbox, fw, fh);
    topFrames.push(buf);
  }

  // Bottom Row (4 poses: Ready, Cross Slash, Jump Slash, Hurt)
  const botSliceW = Math.floor(W / 4);
  const botFrames = [];
  for (let i = 0; i < 4; i++) {
    const bbox = findBoundingBox(data, W, i * botSliceW, (i + 1) * botSliceW, rowH + 40, H);
    const buf = await extractCharacterFrame(cleanBuffer, bbox, fw, fh);
    botFrames.push(buf);
  }

  // 1. Idle (Ready, Top1, Ready, Top2)
  await sharp({
    create: { width: fw * 4, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: botFrames[0], left: 0, top: 0 },
      { input: topFrames[1], left: fw, top: 0 },
      { input: botFrames[0], left: fw * 2, top: 0 },
      { input: topFrames[2], left: fw * 3, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, "idle.png"));

  // 2. Run (Top0, Top1, Top2, Top3)
  await sharp({
    create: { width: fw * 4, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: topFrames[0], left: 0, top: 0 },
      { input: topFrames[1], left: fw, top: 0 },
      { input: topFrames[2], left: fw * 2, top: 0 },
      { input: topFrames[3], left: fw * 3, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, "run.png"));

  // 3. Attack (Ready, Cross Slash, Jump Slash, Ready)
  await sharp({
    create: { width: fw * 4, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: botFrames[0], left: 0, top: 0 },
      { input: botFrames[1], left: fw, top: 0 },
      { input: botFrames[2], left: fw * 2, top: 0 },
      { input: botFrames[0], left: fw * 3, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, "attack.png"));

  // 4. Hurt (Hurt, Hurt, Ready, Top0)
  await sharp({
    create: { width: fw * 4, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: botFrames[3], left: 0, top: 0 },
      { input: botFrames[3], left: fw, top: 0 },
      { input: botFrames[0], left: fw * 2, top: 0 },
      { input: topFrames[0], left: fw * 3, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, "hurt.png"));

  console.log("✓ Ybor Blade sheets generated!");
}

async function processBoss() {
  console.log("Processing Syndicate Boss from Nano Banana generation...");
  const src = ENEMY_INPUTS.boss;
  const outDir = path.join(OUT_DIR, "boss");
  fs.mkdirSync(outDir, { recursive: true });

  const rawImage = sharp(src);
  const { data, info } = await rawImage.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  removeBackground(data, info.width, info.height, false); // White background

  const cleanBuffer = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();

  const fw = 180;
  const fh = 200;
  const W = info.width;
  const H = info.height;
  const rowH = Math.floor(H / 3);

  // Row 1: Idle Stalk (7 poses)
  const r1SliceW = Math.floor(W / 7);
  const r1Frames = [];
  for (let i = 0; i < 7; i++) {
    const bbox = findBoundingBox(data, W, i * r1SliceW, (i + 1) * r1SliceW, 35, rowH);
    const buf = await extractCharacterFrame(cleanBuffer, bbox, fw, fh);
    r1Frames.push(buf);
  }

  // Row 2: Shockwave Cane Slam (7 poses)
  const r2SliceW = Math.floor(W / 7);
  const r2Frames = [];
  for (let i = 0; i < 7; i++) {
    const bbox = findBoundingBox(data, W, i * r2SliceW, (i + 1) * r2SliceW, rowH + 35, rowH * 2);
    const buf = await extractCharacterFrame(cleanBuffer, bbox, fw, fh);
    r2Frames.push(buf);
  }

  // Row 3: Rage Stagger (7 poses)
  const r3SliceW = Math.floor(W / 7);
  const r3Frames = [];
  for (let i = 0; i < 7; i++) {
    const bbox = findBoundingBox(data, W, i * r3SliceW, (i + 1) * r3SliceW, rowH * 2 + 35, H);
    const buf = await extractCharacterFrame(cleanBuffer, bbox, fw, fh);
    r3Frames.push(buf);
  }

  // 1. Idle (R1[0], R1[1], R1[2], R1[3])
  await sharp({
    create: { width: fw * 4, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: r1Frames[0], left: 0, top: 0 },
      { input: r1Frames[1], left: fw, top: 0 },
      { input: r1Frames[2], left: fw * 2, top: 0 },
      { input: r1Frames[3], left: fw * 3, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, "idle.png"));

  // 2. Run (R1[4], R1[5], R1[6], R1[0])
  await sharp({
    create: { width: fw * 4, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: r1Frames[4], left: 0, top: 0 },
      { input: r1Frames[5], left: fw, top: 0 },
      { input: r1Frames[6], left: fw * 2, top: 0 },
      { input: r1Frames[0], left: fw * 3, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, "run.png"));

  // 3. Attack (R2[2] Overhead, R2[3] Slam, R2[5] Radial Shockwave, R2[0] Recover)
  await sharp({
    create: { width: fw * 4, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: r2Frames[2], left: 0, top: 0 },
      { input: r2Frames[3], left: fw, top: 0 },
      { input: r2Frames[5], left: fw * 2, top: 0 },
      { input: r2Frames[0], left: fw * 3, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, "attack.png"));

  // 4. Hurt (R3[1], R3[4], R3[5], R3[0])
  await sharp({
    create: { width: fw * 4, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: r3Frames[1], left: 0, top: 0 },
      { input: r3Frames[4], left: fw, top: 0 },
      { input: r3Frames[5], left: fw * 2, top: 0 },
      { input: r3Frames[0], left: fw * 3, top: 0 },
    ])
    .png()
    .toFile(path.join(outDir, "hurt.png"));

  console.log("✓ Syndicate Boss sheets generated!");
}

async function run() {
  await processBruiser();
  await processBlade();
  await processBoss();
  console.log("🎉 All Nano Banana enemy sprite sheets extracted and deployed successfully!");
}

run().catch(console.error);
