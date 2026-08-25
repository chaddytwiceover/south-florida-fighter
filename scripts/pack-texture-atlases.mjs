import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MAX_ATLAS_SIZE = 2048;
const SPRITE_ROOT = path.resolve("public/game/sprites");
const ATLAS_ROOT = path.resolve("public/game/atlases");

function normalizePath(file) {
  return file.split(path.sep).join("/");
}

function textureKeyForSprite(relativePath) {
  const noExt = relativePath.replace(/\.png$/i, "");
  const parts = noExt.split("/");
  if (parts[0] === "characters" && parts.length >= 3 && parts[2] !== "portrait") {
    return `${parts[1]}-${parts[2]}`;
  }
  if (parts[0] === "enemies" && parts.length >= 3) {
    return `${parts[1]}-${parts[2]}`;
  }
  if (parts[0] === "fx") {
    return `${parts[1]}-fx`;
  }
  return parts.at(-1);
}

function isSheet(relativePath, width, height) {
  const parts = relativePath.split("/");
  if (parts[0] === "characters" && parts[2] !== "portrait") return width % 4 === 0;
  if (parts[0] === "enemies") return width % 4 === 0;
  if (parts[0] === "fx") return width % 4 === 0;
  return false;
}

function collectPngs(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectPngs(full));
    else if (entry.isFile() && entry.name.endsWith(".png")) files.push(full);
  }
  return files;
}

async function makeGroups() {
  const groups = [];
  for (const file of collectPngs(SPRITE_ROOT)) {
    const relativePath = normalizePath(path.relative(SPRITE_ROOT, file));
    const meta = await sharp(file).metadata();
    if (!meta.width || !meta.height) continue;
    const textureKey = textureKeyForSprite(relativePath);

    if (isSheet(relativePath, meta.width, meta.height)) {
      const frameCount = 4;
      const frameWidth = Math.floor(meta.width / frameCount);
      const frames = [];
      for (let i = 0; i < frameCount; i += 1) {
        const frame = await trimFrame(file, {
          left: i * frameWidth,
          top: 0,
          width: frameWidth,
          height: meta.height,
        });
        frames.push({
          ...frame,
          name: `sheet:${textureKey}:${i}`,
        });
      }
      groups.push({
        key: textureKey,
        width: frames.reduce((sum, frame) => sum + frame.width, 0),
        height: Math.max(...frames.map((frame) => frame.height)),
        frames,
      });
      continue;
    }

    const frame = await trimFrame(file, {
      left: 0,
      top: 0,
      width: meta.width,
      height: meta.height,
    });
    groups.push({
      key: textureKey,
      width: frame.width,
      height: frame.height,
      frames: [
        {
          ...frame,
          name: `image:${textureKey}`,
        },
      ],
    });
  }

  return groups.sort((a, b) => b.height - a.height || b.width - a.width);
}

async function trimFrame(file, sourceRect) {
  const { data, info } = await sharp(file)
    .extract(sourceRect)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * info.channels + 3];
      if (alpha === 0) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return {
      source: file,
      sourceRect: { ...sourceRect, width: 1, height: 1 },
      spriteSourceSize: { x: 0, y: 0, w: 1, h: 1 },
      sourceSize: { w: sourceRect.width, h: sourceRect.height },
      width: 1,
      height: 1,
    };
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  return {
    source: file,
    sourceRect: {
      left: sourceRect.left + minX,
      top: sourceRect.top + minY,
      width,
      height,
    },
    spriteSourceSize: { x: minX, y: minY, w: width, h: height },
    sourceSize: { w: sourceRect.width, h: sourceRect.height },
    width,
    height,
  };
}

function packGroups(groups) {
  const frames = groups
    .flatMap((group) => group.frames)
    .sort((a, b) => b.height - a.height || b.width - a.width);
  const atlases = [];
  let current = newAtlas();

  for (const frame of frames) {
    if (frame.width > MAX_ATLAS_SIZE || frame.height > MAX_ATLAS_SIZE) {
      throw new Error(`${frame.name} is too large for ${MAX_ATLAS_SIZE}x${MAX_ATLAS_SIZE}`);
    }

    if (!tryPlace(current, frame)) {
      atlases.push(current);
      current = newAtlas();
      if (!tryPlace(current, frame)) throw new Error(`Could not place ${frame.name}`);
    }
  }

  atlases.push(current);
  return atlases;
}

function newAtlas() {
  return {
    width: MAX_ATLAS_SIZE,
    height: MAX_ATLAS_SIZE,
    x: 0,
    y: 0,
    rowHeight: 0,
    freeRects: [{ x: 0, y: 0, width: MAX_ATLAS_SIZE, height: MAX_ATLAS_SIZE }],
    frames: [],
  };
}

function tryPlace(atlas, frame) {
  let bestIndex = -1;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let i = 0; i < atlas.freeRects.length; i += 1) {
    const rect = atlas.freeRects[i];
    if (frame.width > rect.width || frame.height > rect.height) continue;
    const leftoverX = rect.width - frame.width;
    const leftoverY = rect.height - frame.height;
    const score = Math.min(leftoverX, leftoverY) * 1_000_000 + leftoverX * leftoverY;
    if (score < bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex < 0) return false;

  const slot = atlas.freeRects.splice(bestIndex, 1)[0];
  atlas.frames.push({ ...frame, x: slot.x, y: slot.y });

  const right = {
    x: slot.x + frame.width,
    y: slot.y,
    width: slot.width - frame.width,
    height: frame.height,
  };
  const bottom = {
    x: slot.x,
    y: slot.y + frame.height,
    width: slot.width,
    height: slot.height - frame.height,
  };
  if (right.width > 0 && right.height > 0) atlas.freeRects.push(right);
  if (bottom.width > 0 && bottom.height > 0) atlas.freeRects.push(bottom);
  pruneFreeRects(atlas.freeRects);
  return true;
}

function pruneFreeRects(freeRects) {
  for (let i = 0; i < freeRects.length; i += 1) {
    for (let j = i + 1; j < freeRects.length; j += 1) {
      if (contains(freeRects[i], freeRects[j])) {
        freeRects.splice(j, 1);
        j -= 1;
      } else if (contains(freeRects[j], freeRects[i])) {
        freeRects.splice(i, 1);
        i -= 1;
        break;
      }
    }
  }
}

function contains(a, b) {
  return (
    b.x >= a.x &&
    b.y >= a.y &&
    b.x + b.width <= a.x + a.width &&
    b.y + b.height <= a.y + a.height
  );
}

async function writeAtlas(atlas, index) {
  const key = `sprites-${index}`;
  const png = path.join(ATLAS_ROOT, `${key}.png`);
  const json = path.join(ATLAS_ROOT, `${key}.json`);
  const composites = [];
  const frameJson = {};

  for (const frame of atlas.frames) {
    const input = await sharp(frame.source)
      .extract(frame.sourceRect)
      .png()
      .toBuffer();
    composites.push({ input, left: frame.x, top: frame.y });
    frameJson[frame.name] = {
      frame: { x: frame.x, y: frame.y, w: frame.width, h: frame.height },
      rotated: false,
      trimmed: true,
      spriteSourceSize: frame.spriteSourceSize,
      sourceSize: frame.sourceSize,
    };
  }

  await sharp({
    create: {
      width: MAX_ATLAS_SIZE,
      height: MAX_ATLAS_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(png);

  await fs.promises.writeFile(
    json,
    JSON.stringify(
      {
        frames: frameJson,
        meta: {
          app: "scripts/pack-texture-atlases.mjs",
          image: `${key}.png`,
          size: { w: MAX_ATLAS_SIZE, h: MAX_ATLAS_SIZE },
          scale: "1",
        },
      },
      null,
      2,
    ),
  );

  return { key, image: `/game/atlases/${key}.png`, json: `/game/atlases/${key}.json`, frames: atlas.frames.length };
}

async function main() {
  fs.mkdirSync(ATLAS_ROOT, { recursive: true });
  for (const file of fs.readdirSync(ATLAS_ROOT)) {
    if (/^sprites-\d+\.(png|json)$/.test(file) || file === "manifest.json") {
      fs.rmSync(path.join(ATLAS_ROOT, file), { force: true });
    }
  }

  const groups = await makeGroups();
  const atlases = packGroups(groups);
  const manifest = [];
  for (let i = 0; i < atlases.length; i += 1) {
    manifest.push(await writeAtlas(atlases[i], i));
  }
  await fs.promises.writeFile(
    path.join(ATLAS_ROOT, "manifest.json"),
    JSON.stringify({ maxSize: MAX_ATLAS_SIZE, atlases: manifest }, null, 2),
  );
  console.log(`Packed ${groups.length} sprite groups into ${atlases.length} atlases.`);
}

await main();
