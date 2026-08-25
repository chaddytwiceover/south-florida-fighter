import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const GENERATED_ROOT =
  "C:/Users/thech/.codex/generated_images/01a031b6-c82a-7343-8ec6-e89ab2a7a040";

const STRIPS = [
  ["bruiser", "idle", "call_BLM0OcKpSln65N04cHdX7tzX.png"],
  ["bruiser", "run", "call_FTIZVghY4Y2Mm8FyCKDBt5C9.png"],
  ["bruiser", "attack", "call_K7QYmTBdVWagrou2s4oNUSF7.png"],
  ["bruiser", "hurt", "call_28tiSIgu0iCGRNqtkmK7g9k3.png"],
  ["blade", "idle", "call_ywYQtVhF3vtzJjQzCOiSUNV9.png"],
  ["blade", "run", "call_mOxmv0EZKBAjw1V3A98fuvif.png"],
  ["blade", "attack", "call_ubh0JwyodPooPW3qssrnmPR4.png"],
  ["blade", "hurt", "call_j4CWuMUTO6jPo0MoerhlGaeV.png"],
  ["boss", "idle", "call_fGgQZRQL9Szdfv8iJTyLJyrx.png"],
  ["boss", "run", "call_UR2CfWOe7VMmYr8CHqiQ79Be.png"],
  ["boss", "attack", "call_Kjyrz1gsYwIPYq1qHVwtd1pU.png"],
  // The generated hurt variants included a backdrop, so keep the existing clean hurt strip.
];

const FRAME = {
  bruiser: { width: 160, height: 180, spriteHeight: 170 },
  blade: { width: 160, height: 180, spriteHeight: 166 },
  boss: { width: 180, height: 200, spriteHeight: 194 },
};

function idx(x, y, width) {
  return (y * width + x) * 4;
}

function isFringe(r, g, b, a) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;
  return a < 170 || (sat > 120 && (r > 210 || b > 210) && g < 90);
}

function cleanMask(data, width, height) {
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = idx(x, y, width);
      const a = data[p + 3];
      if (a <= 24) continue;
      if (isFringe(data[p], data[p + 1], data[p + 2], a)) continue;
      mask[y * width + x] = 1;
    }
  }
  return keepCharacterComponents(mask, width, height);
}

function keepCharacterComponents(mask, width, height) {
  const seen = new Uint8Array(mask.length);
  const keep = new Uint8Array(mask.length);
  const queue = [];
  const components = [];

  for (let i = 0; i < mask.length; i += 1) {
    if (!mask[i] || seen[i]) continue;
    seen[i] = 1;
    queue.length = 0;
    queue.push(i);
    const pixels = [];
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let q = 0; q < queue.length; q += 1) {
      const cur = queue[q];
      pixels.push(cur);
      const x = cur % width;
      const y = Math.floor(cur / width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      const neighbors = [cur - 1, cur + 1, cur - width, cur + width];
      for (const next of neighbors) {
        if (next < 0 || next >= mask.length || seen[next] || !mask[next]) continue;
        const nx = next % width;
        if ((next === cur - 1 && nx !== x - 1) || (next === cur + 1 && nx !== x + 1)) {
          continue;
        }
        seen[next] = 1;
        queue.push(next);
      }
    }

    const touches =
      Number(minX === 0) + Number(maxX === width - 1) + Number(minY === 0) + Number(maxY === height - 1);
    components.push({ pixels, area: pixels.length, minX, minY, maxX, maxY, touches });
  }

  const candidates = components
    .filter((c) => c.area > 80)
    .filter((c) => !(c.touches >= 3 && c.area > width * height * 0.12))
    .sort((a, b) => b.area - a.area);

  const main = candidates[0];
  if (!main) return keep;
  const closeToMain = (c) => {
    const dx = Math.max(main.minX - c.maxX, c.minX - main.maxX, 0);
    const dy = Math.max(main.minY - c.maxY, c.minY - main.maxY, 0);
    return Math.hypot(dx, dy) <= 28;
  };

  for (const component of candidates.filter((c, i) => i === 0 || (c.area > 180 && closeToMain(c)))) {
    for (const p of component.pixels) keep[p] = 1;
  }

  return keep;
}

function bounds(mask, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!mask[y * width + x]) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return maxX >= 0 ? { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 } : null;
}

async function hardenAlpha(buffer, threshold = 58) {
  const image = sharp(buffer).ensureAlpha();
  const meta = await image.metadata();
  const data = await image.raw().toBuffer();
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha <= threshold) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    } else {
      data[i + 3] = 255;
    }
  }
  return sharp(data, { raw: { width: meta.width, height: meta.height, channels: 4 } })
    .png()
    .toBuffer();
}

async function processStrip(id, action, fileName) {
  const source = path.join(GENERATED_ROOT, fileName);
  const config = FRAME[id];
  const image = sharp(source).ensureAlpha();
  const meta = await image.metadata();
  const raw = await image.raw().toBuffer();
  const cellWidth = Math.floor(meta.width / 4);

  const outFrames = [];
  const assetDir = path.resolve("assets/sprites/enemies", id, action);
  fs.mkdirSync(assetDir, { recursive: true });
  fs.copyFileSync(source, path.resolve("assets/sprites/enemies", id, `${action}-source.png`));

  for (let frame = 0; frame < 4; frame += 1) {
    const left = frame * cellWidth;
    const right = frame === 3 ? meta.width : (frame + 1) * cellWidth;
    const width = right - left;
    const height = meta.height;
    const data = Buffer.alloc(width * height * 4);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const src = idx(left + x, y, meta.width);
        const dst = idx(x, y, width);
        raw.copy(data, dst, src, src + 4);
      }
    }

    const mask = cleanMask(data, width, height);
    const b = bounds(mask, width, height);
    if (!b) throw new Error(`No sprite pixels found for ${id}/${action} frame ${frame + 1}`);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const p = idx(x, y, width);
        if (!mask[y * width + x]) {
          data[p] = 0;
          data[p + 1] = 0;
          data[p + 2] = 0;
          data[p + 3] = 0;
        } else if (data[p + 3] > 0) {
          data[p + 3] = data[p + 3] > 130 ? 255 : 0;
        }
      }
    }

    const extractRect = {
      left: Math.max(0, Math.min(width - 1, b.minX)),
      top: Math.max(0, Math.min(height - 1, b.minY)),
      width: Math.max(1, Math.min(width - b.minX, b.width)),
      height: Math.max(1, Math.min(height - b.minY, b.height)),
    };

    const croppedData = Buffer.alloc(extractRect.width * extractRect.height * 4);
    for (let cy = 0; cy < extractRect.height; cy += 1) {
      for (let cx = 0; cx < extractRect.width; cx += 1) {
        const src = idx(extractRect.left + cx, extractRect.top + cy, width);
        const dst = idx(cx, cy, extractRect.width);
        data.copy(croppedData, dst, src, src + 4);
      }
    }
    const crop = await sharp(croppedData, {
      raw: { width: extractRect.width, height: extractRect.height, channels: 4 },
    })
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
      .png()
      .toBuffer();
    const cropMeta = await sharp(crop).metadata();
    const scale = Math.min(config.width * 0.92 / cropMeta.width, config.spriteHeight / cropMeta.height, 1);
    const resized = await sharp(crop)
      .resize({
        width: Math.max(1, Math.round(cropMeta.width * scale)),
        height: Math.max(1, Math.round(cropMeta.height * scale)),
        fit: "inside",
        kernel: "lanczos3",
      })
      .png()
      .toBuffer();
    const resizedMeta = await sharp(resized).metadata();
    const canvas = await hardenAlpha(await sharp({
      create: {
        width: config.width,
        height: config.height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: resized,
          left: Math.round((config.width - resizedMeta.width) / 2),
          top: config.height - resizedMeta.height,
        },
      ])
      .png()
      .toBuffer());

    outFrames.push(canvas);
    await fs.promises.writeFile(path.join(assetDir, `${action}-${frame + 1}.png`), canvas);
  }

  const sheet = await hardenAlpha(await sharp({
    create: {
      width: config.width * 4,
      height: config.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(outFrames.map((input, i) => ({ input, left: i * config.width, top: 0 })))
    .png()
    .toBuffer());

  const publicDir = path.resolve("public/game/sprites/enemies", id);
  fs.mkdirSync(publicDir, { recursive: true });
  await fs.promises.writeFile(path.join(publicDir, `${action}.png`), sheet);
  await fs.promises.writeFile(path.join(assetDir, "sheet-transparent.png"), sheet);
  console.log(`${id}/${action}`);
}

for (const [id, action, file] of STRIPS) {
  await processStrip(id, action, file);
}
