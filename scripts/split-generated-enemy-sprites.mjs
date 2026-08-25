import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ACTIONS = ["idle", "run", "attack", "hurt"];

const ENEMIES = [
  {
    id: "bruiser",
    frameWidth: 160,
    frameHeight: 180,
    source: "assets/sprites/enemies/bruiser/generated-source.png",
  },
  {
    id: "blade",
    frameWidth: 160,
    frameHeight: 180,
    source: "assets/sprites/enemies/blade/generated-source.png",
  },
  {
    id: "boss",
    frameWidth: 180,
    frameHeight: 200,
    source: "assets/sprites/enemies/boss/generated-source.png",
    scrubRedArtifacts: true,
  },
];

function alphaBounds(data, width, height, channels) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * channels + 3];
      if (alpha > 24) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { left: 0, top: 0, width, height };
  }

  const pad = 6;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const right = Math.min(width - 1, maxX + pad);
  const bottom = Math.min(height - 1, maxY + pad);

  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}

function pruneSmallComponents(data, width, height, channels) {
  const visited = new Uint8Array(width * height);
  const components = [];
  const queue = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const start = y * width + x;
      if (visited[start] || data[start * channels + 3] <= 24) continue;

      visited[start] = 1;
      queue.length = 0;
      queue.push(start);
      const pixels = [];
      let head = 0;

      while (head < queue.length) {
        const index = queue[head++];
        pixels.push(index);
        const px = index % width;
        const py = Math.floor(index / width);
        const neighbors = [
          [px + 1, py],
          [px - 1, py],
          [px, py + 1],
          [px, py - 1],
        ];

        for (const [nx, ny] of neighbors) {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const next = ny * width + nx;
          if (visited[next] || data[next * channels + 3] <= 24) continue;
          visited[next] = 1;
          queue.push(next);
        }
      }

      components.push(pixels);
    }
  }

  if (components.length <= 1) return data;

  components.sort((a, b) => b.length - a.length);
  const keep = new Uint8Array(width * height);
  const largest = components[0].length;
  for (const component of components) {
    if (component.length < largest * 0.06) continue;
    for (const index of component) keep[index] = 1;
  }

  for (let index = 0; index < width * height; index++) {
    if (!keep[index]) data[index * channels + 3] = 0;
  }

  return data;
}

function scrubRedArtifacts(data, width, height, channels) {
  for (let index = 0; index < width * height; index++) {
    const offset = index * channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    if (red > 165 && green < 95 && blue < 95) {
      data[offset + 3] = 0;
    }
  }
  return data;
}

async function makeFrame(source, crop, frameWidth, frameHeight, options = {}) {
  const cell = await sharp(source)
    .extract(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pruned = pruneSmallComponents(
    Buffer.from(cell.data),
    cell.info.width,
    cell.info.height,
    cell.info.channels,
  );
  if (options.scrubRedArtifacts) {
    scrubRedArtifacts(pruned, cell.info.width, cell.info.height, cell.info.channels);
  }
  const bounds = alphaBounds(pruned, cell.info.width, cell.info.height, cell.info.channels);

  const trimmed = await sharp(pruned, {
    raw: {
      width: cell.info.width,
      height: cell.info.height,
      channels: cell.info.channels,
    },
  })
    .extract(bounds)
    .resize(Math.round(frameWidth * 0.9), Math.round(frameHeight * 0.88), {
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  const meta = await sharp(trimmed).metadata();
  return {
    input: trimmed,
    left: Math.round((frameWidth - meta.width) / 2),
    top: frameHeight - meta.height - 3,
  };
}

async function splitEnemy({ id, frameWidth, frameHeight, source, scrubRedArtifacts }) {
  const sourcePath = path.resolve(source);
  const publicDir = path.resolve("public/game/sprites/enemies", id);
  const assetDir = path.resolve("assets/sprites/enemies", id);
  const meta = await sharp(sourcePath).metadata();
  const cellWidth = Math.floor(meta.width / 4);
  const cellHeight = Math.floor(meta.height / 4);

  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(assetDir, { recursive: true });

  for (let row = 0; row < ACTIONS.length; row++) {
    const action = ACTIONS[row];
    const actionDir = path.join(assetDir, action);
    fs.mkdirSync(actionDir, { recursive: true });

    const frames = [];
    for (let col = 0; col < 4; col++) {
      const left = Math.min(col * cellWidth, meta.width - 1);
      const top = Math.min(row * cellHeight, meta.height - 1);
      const width = col === 3 ? meta.width - left : cellWidth;
      const height = row === 3 ? meta.height - top : cellHeight;
      const frame = await makeFrame(
        sourcePath,
        { left, top, width, height },
        frameWidth,
        frameHeight,
        { scrubRedArtifacts },
      );
      frames.push({
        ...frame,
        left: col * frameWidth + frame.left,
      });

      await sharp({
        create: {
          width: frameWidth,
          height: frameHeight,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([frame])
        .png()
        .toFile(path.join(actionDir, `${action}-${col + 1}.png`));
    }

    const output = path.join(publicDir, `${action}.png`);
    await sharp({
      create: {
        width: frameWidth * 4,
        height: frameHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(frames)
      .png()
      .toFile(output);

    await fs.promises.copyFile(output, path.join(actionDir, "sheet-transparent.png"));
  }

  console.log(`split ${id}`);
}

for (const enemy of ENEMIES) {
  await splitEnemy(enemy);
}
