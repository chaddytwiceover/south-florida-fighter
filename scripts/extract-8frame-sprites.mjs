import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * 8-Frame Mega Sheet Slicer & Normalizer for South Florida Fighter
 * Handles the 8-frame unified pipeline:
 * - Frames 0-2: Run Cycle (Contact, Passing, Extended)
 * - Frames 3-5: Attack Cycle (Anticipation Windup, Active Contact, Recovery)
 * - Frames 6-7: Hurt / Hitstun (Impact Peak, Stagger Recovery)
 */

const COLOR_DIST_SQ = 22 * 22;

function isBgColor(r, g, b) {
  // Pure white or near white
  if (r > 240 && g > 240 && b > 240) return true;
  // Checkerboard gray (190-210)
  if (Math.abs(r - g) < 8 && Math.abs(g - b) < 8) {
    if (r > 185 && r < 215) return true;
    if (r > 225) return true;
    if (r < 18) return true; // pitch black backdrop
  }
  return false;
}

function floodFillAlpha(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  function pushPixel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;

    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];

    if (isBgColor(r, g, b)) {
      data[p + 3] = 0; // Transparent
      queue.push(idx);
    }
  }

  // Seed 4 outer borders
  for (let x = 0; x < width; x++) {
    pushPixel(x, 0);
    pushPixel(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushPixel(0, y);
    pushPixel(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    // 8-way neighbors
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
            if (isBgColor(data[np], data[np + 1], data[np + 2])) {
              data[np + 3] = 0;
              queue.push(nidx);
            }
          }
        }
      }
    }
  }
}

function findCharacterBBox(data, width, height, startX, endX) {
  let minX = endX;
  let maxX = startX;
  let minY = height;
  let maxY = 0;
  let hasPixels = false;

  for (let y = 0; y < height; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 30) {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasPixels) return null;
  return { minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

export async function process8FrameSheet(inputPath, outputDir, targetFrameW = 160, targetFrameH = 180) {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file does not exist: ${inputPath}`);
    return false;
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const rawImage = sharp(inputPath);
  const meta = await rawImage.metadata();
  const { data, info } = await rawImage.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const fullW = info.width;
  const fullH = info.height;

  // Flood fill background transparency
  floodFillAlpha(data, fullW, fullH);

  const cleanBuffer = await sharp(data, {
    raw: { width: fullW, height: fullH, channels: 4 },
  }).png().toBuffer();

  const sliceW = Math.floor(fullW / 8);
  const frameBuffers = [];

  // Extract all 8 frames
  for (let i = 0; i < 8; i++) {
    const startX = i * sliceW;
    const endX = Math.min(fullW, (i + 1) * sliceW);
    const bbox = findCharacterBBox(data, fullW, fullH, startX, endX);

    if (!bbox || bbox.width < 10 || bbox.height < 10) {
      // Fallback blank frame
      const blank = await sharp({
        create: {
          width: targetFrameW,
          height: targetFrameH,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      }).png().toBuffer();
      frameBuffers.push(blank);
      continue;
    }

    const charCrop = await sharp(cleanBuffer)
      .extract({
        left: bbox.minX,
        top: bbox.minY,
        width: bbox.width,
        height: bbox.height,
      })
      .toBuffer();

    const maxW = targetFrameW * 0.85;
    const maxH = targetFrameH * 0.88;
    const scale = Math.min(maxW / bbox.width, maxH / bbox.height, 1.0);
    const fitW = Math.round(bbox.width * scale);
    const fitH = Math.round(bbox.height * scale);

    const resizedChar = await sharp(charCrop)
      .resize(fitW, fitH, { fit: "contain" })
      .toBuffer();

    const destX = Math.round((targetFrameW - fitW) / 2);
    const destY = targetFrameH - fitH - 4; // Bottom-anchor

    const composed = await sharp({
      create: {
        width: targetFrameW,
        height: targetFrameH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: resizedChar, left: Math.max(0, destX), top: Math.max(0, destY) }])
      .png()
      .toBuffer();

    frameBuffers.push(composed);
  }

  // 1. Export 8-Frame Master Sheet
  const masterSheet = await sharp({
    create: {
      width: targetFrameW * 8,
      height: targetFrameH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(
      frameBuffers.map((buf, idx) => ({
        input: buf,
        left: idx * targetFrameW,
        top: 0,
      })),
    )
    .png()
    .toFile(path.join(outputDir, "master-8frame.png"));

  // 2. Export Modular Action Sheets:
  // Run (Frames 0, 1, 2)
  await sharp({
    create: {
      width: targetFrameW * 3,
      height: targetFrameH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: frameBuffers[0], left: 0, top: 0 },
      { input: frameBuffers[1], left: targetFrameW, top: 0 },
      { input: frameBuffers[2], left: targetFrameW * 2, top: 0 },
    ])
    .png()
    .toFile(path.join(outputDir, "run.png"));

  // Attack (Frames 3, 4, 5)
  await sharp({
    create: {
      width: targetFrameW * 3,
      height: targetFrameH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: frameBuffers[3], left: 0, top: 0 },
      { input: frameBuffers[4], left: targetFrameW, top: 0 },
      { input: frameBuffers[5], left: targetFrameW * 2, top: 0 },
    ])
    .png()
    .toFile(path.join(outputDir, "attack.png"));

  // Hurt (Frames 6, 7)
  await sharp({
    create: {
      width: targetFrameW * 2,
      height: targetFrameH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: frameBuffers[6], left: 0, top: 0 },
      { input: frameBuffers[7], left: targetFrameW, top: 0 },
    ])
    .png()
    .toFile(path.join(outputDir, "hurt.png"));

  console.log(`Successfully processed 8-frame mega sheet to ${outputDir}`);
  return true;
}

// CLI test harness
if (process.argv[2]) {
  const file = process.argv[2];
  const out = process.argv[3] || "./out-sprites";
  const fw = parseInt(process.argv[4] || "160", 10);
  const fh = parseInt(process.argv[5] || "180", 10);
  process8FrameSheet(file, out, fw, fh);
}
