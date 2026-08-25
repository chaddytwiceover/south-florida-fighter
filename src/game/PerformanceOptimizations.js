// @ts-nocheck
import * as PhaserNS from "phaser";

const Phaser = PhaserNS.default ?? PhaserNS;

export const MAX_MOBILE_ATLAS_SIZE = 2048;
export const SPRITE_ATLAS_KEYS = ["sprites-0"];

const poolMap = new WeakMap();
const WAVE_CLIP = { textureKey: "wave-fx", frames: 4, frameRate: 14, repeat: -1, key: "wave-fx" };

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function selectOptimizedRenderer(PhaserLib) {
  if (typeof window === "undefined") return PhaserLib.AUTO;
  const nav = window.navigator ?? {};
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  const narrowViewport = window.innerWidth <= 640;
  const embedded = window.self !== window.top;
  return lowMemory || narrowViewport || embedded ? PhaserLib.CANVAS : PhaserLib.AUTO;
}

export function optimizedRenderConfig() {
  return {
    antialias: false,
    pixelArt: false,
    powerPreference: "low-power",
    roundPixels: true,
  };
}

export function preloadTextureAtlases(scene) {
  for (const key of SPRITE_ATLAS_KEYS) {
    if (scene.textures.exists(key)) continue;
    scene.load.atlas(key, `/game/atlases/${key}.png`, `/game/atlases/${key}.json`);
  }
}

export function preloadFightBackground(scene, level) {
  const key = backgroundKey(level.id);
  if (!scene.textures.exists(key)) scene.load.image(key, level.parallax.far);
  if (!scene.textures.exists("ground")) {
    scene.load.image("ground", "/game/backgrounds/fort-lauderdale/ground.jpg");
  }
}

export function enforceSteadyFrameRate(scene) {
  scene.time.timeScale = 1.0;
  scene.time.paused = false;
  if (scene.physics?.world) {
    scene.physics.world.setFPS?.(60);
    scene.physics.world.fps = 60;
  }
  if (scene.physics) scene.physics.framerate = 60;
  if (scene.game?.loop) {
    scene.game.loop.targetFps = 60;
    scene.game.loop.forceSetTimeOut = true;
  }
}

export function backgroundKey(levelId) {
  return `bg-${levelId}`;
}

export function createLazyParallaxBackground(scene, level, width) {
  const key = scene.textures.exists(backgroundKey(level.id))
    ? backgroundKey(level.id)
    : backgroundKey("fort-lauderdale");
  const bgHeight = level.groundY + 60;
  const far = scene.add
    .tileSprite(0, 0, width, bgHeight, key)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(0);

  const tex = scene.textures.get(key).getSourceImage();
  const texHeight = tex?.height || 1080;
  const bgScale = bgHeight / texHeight;
  far.tileScaleY = bgScale;
  far.tileScaleX = bgScale;

  return { far, bgScale };
}

function atlasKeyForFrame(scene, frameName) {
  for (const key of SPRITE_ATLAS_KEYS) {
    const texture = scene.textures.get(key);
    if (texture?.has?.(frameName)) return key;
  }
  return null;
}

export function atlasFrameNameForClip(clip, frame = 0) {
  return `sheet:${clip.textureKey}:${frame}`;
}

export function atlasFrameNameForImage(key) {
  return `image:${key}`;
}

export function resolveClipTexture(scene, clip, frame = 0) {
  const frameName = atlasFrameNameForClip(clip, frame);
  const atlasKey = atlasKeyForFrame(scene, frameName);
  if (atlasKey) return { key: atlasKey, frame: frameName, atlas: true };
  return { key: clip.textureKey, frame, atlas: false };
}

export function setSpriteClipFrame(sprite, clip, frame = 0) {
  const resolved = resolveClipTexture(sprite.scene, clip, frame);
  sprite.setTexture(resolved.key, resolved.frame);
}

export function createOptimizedAnimation(scene, clip) {
  if (scene.anims.exists(clip.key)) return;
  const firstFrame = atlasFrameNameForClip(clip, 0);
  const atlasKey = atlasKeyForFrame(scene, firstFrame);
  if (atlasKey) {
    scene.anims.create({
      key: clip.key,
      frames: scene.anims.generateFrameNames(atlasKey, {
        prefix: `sheet:${clip.textureKey}:`,
        start: 0,
        end: clip.frames - 1,
      }),
      frameRate: clip.frameRate,
      repeat: clip.repeat,
    });
    return;
  }

  scene.anims.create({
    key: clip.key,
    frames: scene.anims.generateFrameNumbers(clip.textureKey, {
      start: 0,
      end: clip.frames - 1,
    }),
    frameRate: clip.frameRate,
    repeat: clip.repeat,
  });
}

export function addOptimizedImage(scene, x, y, key) {
  const frame = atlasFrameNameForImage(key);
  const atlasKey = atlasKeyForFrame(scene, frame);
  if (atlasKey) return scene.add.image(x, y, atlasKey, frame);
  return scene.add.image(x, y, key);
}

function createPools(scene) {
  const pool = {
    floatTexts: [],
    sparkLines: [],
    sparkDots: [],
    rings: [],
    projectiles: [],
    hitboxes: [],
  };

  for (let i = 0; i < 36; i += 1) {
    pool.floatTexts.push(
      scene.add
        .text(0, 0, "", {
          fontFamily: "Bebas Neue, Impact, sans-serif",
          fontSize: "32px",
          color: "#ffffff",
          stroke: "#0c1a24",
          strokeThickness: 6,
        })
        .setOrigin(0.5, 1)
        .setDepth(50)
        .setVisible(false)
        .setActive(false),
    );
  }

  for (let i = 0; i < 96; i += 1) {
    pool.sparkLines.push(scene.add.line(0, 0, 0, 0, 1, 1, 0xffffff).setVisible(false).setActive(false));
    pool.sparkDots.push(scene.add.circle(0, 0, 2, 0xffffff).setVisible(false).setActive(false));
  }

  for (let i = 0; i < 12; i += 1) {
    pool.rings.push(scene.add.circle(0, 0, 4, 0xffffff, 0).setVisible(false).setActive(false));
  }

  for (let i = 0; i < 8; i += 1) {
    const texture = resolveClipTexture(scene, WAVE_CLIP, 0);
    const projectile = scene.physics.add.sprite(0, 0, texture.key, texture.frame);
    projectile.setVisible(false).setActive(false);
    projectile.body?.setEnable(false);
    projectile.body?.setAllowGravity(false);
    pool.projectiles.push(projectile);
  }

  for (let i = 0; i < 24; i += 1) {
    const hitbox = scene.add.rectangle(0, 0, 1, 1, 0xe85d4c, 0);
    hitbox.setOrigin(0.5, 0.5).setDepth(23).setVisible(false).setActive(false);
    scene.physics.add.existing(hitbox);
    hitbox.body?.setAllowGravity(false);
    hitbox.body?.setEnable(false);
    pool.hitboxes.push(hitbox);
  }

  scene.events.once("shutdown", () => {
    for (const items of Object.values(pool)) {
      for (const item of items) item.destroy?.();
    }
    poolMap.delete(scene);
  });

  return pool;
}

export function initPerformancePools(scene) {
  if (!poolMap.has(scene)) poolMap.set(scene, createPools(scene));
  return poolMap.get(scene);
}

function acquire(scene, name, factory) {
  const pool = initPerformancePools(scene);
  const item = pool[name].find((entry) => !entry.active);
  if (item) return item;
  const created = factory();
  pool[name].push(created);
  return created;
}

function releaseGameObject(obj) {
  obj.setActive(false).setVisible(false);
  obj.setAlpha(1).setScale(1);
  obj.clearTint?.();
  if (obj.body) {
    obj.body.stop?.();
    obj.body.setVelocity?.(0, 0);
    obj.body.setEnable?.(false);
  }
}

export function spawnPooledFloatText(scene, x, y, text, color, size = "32px") {
  const label = acquire(scene, "floatTexts", () =>
    scene.add.text(0, 0, "", {
      fontFamily: "Bebas Neue, Impact, sans-serif",
      fontSize: size,
      color,
      stroke: "#0c1a24",
      strokeThickness: 6,
    }),
  );

  scene.tweens.killTweensOf(label);
  label
    .setText(text)
    .setStyle({
      fontFamily: "Bebas Neue, Impact, sans-serif",
      fontSize: size,
      color,
      stroke: "#0c1a24",
      strokeThickness: 6,
    })
    .setPosition(x, y)
    .setOrigin(0.5, 1)
    .setDepth(50)
    .setScale(0.7)
    .setAlpha(1)
    .setVisible(true)
    .setActive(true);

  scene.tweens.add({
    targets: label,
    scaleX: 1.15,
    scaleY: 1.15,
    y: y - 20,
    duration: 120,
    ease: "Back.easeOut",
    onComplete: () => {
      scene.tweens.add({
        targets: label,
        scaleX: 1,
        scaleY: 1,
        y: y - 64,
        alpha: 0,
        duration: 480,
        ease: "Quad.easeIn",
        onComplete: () => releaseGameObject(label),
      });
    },
  });
}

export function spawnPooledSparks(scene, x, y, options = {}) {
  const count = options.count ?? 8;
  const color = options.color ?? 0xffe600;
  const depth = options.depth ?? 45;
  const len = options.length ?? 14;
  const lineWidth = options.lineWidth ?? 3;
  const minSpeed = options.minSpeed ?? 120;
  const maxSpeed = options.maxSpeed ?? 380;
  const duration = options.duration ?? 200;
  const withDots = options.withDots ?? false;

  for (let i = 0; i < count; i += 1) {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = Phaser.Math.FloatBetween(minSpeed, maxSpeed);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const sparkColor = Array.isArray(color) ? color[i % color.length] : color;
    const line = acquire(scene, "sparkLines", () => scene.add.line(0, 0, 0, 0, 1, 1, sparkColor));

    scene.tweens.killTweensOf(line);
    line
      .setPosition(x, y)
      .setTo(0, 0, dx * len, dy * len)
      .setStrokeStyle(lineWidth, sparkColor)
      .setDepth(depth)
      .setAlpha(1)
      .setScale(1)
      .setVisible(true)
      .setActive(true);

    const targets = [line];
    let dot = null;
    if (withDots) {
      dot = acquire(scene, "sparkDots", () => scene.add.circle(0, 0, lineWidth * 1.2, sparkColor));
      scene.tweens.killTweensOf(dot);
      dot
        .setPosition(x, y)
        .setFillStyle(sparkColor, 1)
        .setDepth(depth + 1)
        .setAlpha(1)
        .setScale(1)
        .setVisible(true)
        .setActive(true);
      targets.push(dot);
    }

    scene.tweens.add({
      targets,
      x: x + dx * (speed * 0.18),
      y: y + dy * (speed * 0.18),
      alpha: 0,
      scaleX: 0.15,
      scaleY: 0.15,
      duration,
      ease: "Quad.easeOut",
      onComplete: () => {
        releaseGameObject(line);
        if (dot) releaseGameObject(dot);
      },
    });
  }
}

export function spawnPooledRing(scene, x, y, color, options = {}) {
  const ring = acquire(scene, "rings", () => scene.add.circle(0, 0, 4, color, 0));
  scene.tweens.killTweensOf(ring);
  ring
    .setPosition(x, y)
    .setRadius(4)
    .setFillStyle(color, 0)
    .setStrokeStyle(options.lineWidth ?? 2, color)
    .setDepth(options.depth ?? 45)
    .setScale(1)
    .setAlpha(1)
    .setVisible(true)
    .setActive(true);

  scene.tweens.add({
    targets: ring,
    scaleX: options.scale ?? 3,
    scaleY: options.scale ?? 3,
    alpha: 0,
    duration: options.duration ?? 180,
    ease: "Quad.easeOut",
    onComplete: () => releaseGameObject(ring),
  });
}

export function acquirePooledProjectile(scene, x, y, facing) {
  if (!scene.textures.exists("wave-fx") && !atlasKeyForFrame(scene, "sheet:wave-fx:0")) return null;
  const texture = resolveClipTexture(scene, WAVE_CLIP, 0);
  const projectile = acquire(scene, "projectiles", () =>
    scene.physics.add.sprite(0, 0, texture.key, texture.frame),
  );
  scene.tweens.killTweensOf(projectile);
  projectile
    .setPosition(x + facing * 42, y - 58)
    .setOrigin(0.5, 0.5)
    .setScale(0.95)
    .setFlipX(facing < 0)
    .setDepth(22)
    .setAlpha(1)
    .setVisible(true)
    .setActive(true);
  setSpriteClipFrame(projectile, WAVE_CLIP, 0);
  projectile.body?.setEnable(true);
  projectile.body?.setAllowGravity(false);
  projectile.setVelocity(facing * 520, 0);
  if (scene.anims.exists("wave-fx")) projectile.play("wave-fx");
  scene.time.delayedCall(900, () => releaseProjectile(projectile));
  return projectile;
}

export function releaseProjectile(projectile) {
  if (!projectile?.active) return;
  releaseGameObject(projectile);
}

export function acquireHitbox(scene, spec, debug) {
  const rect = acquire(scene, "hitboxes", () => {
    const hitbox = scene.add.rectangle(0, 0, 1, 1, 0xe85d4c, 0);
    hitbox.setOrigin(0.5, 0.5).setDepth(23);
    scene.physics.add.existing(hitbox);
    hitbox.body?.setAllowGravity(false);
    return hitbox;
  });

  rect
    .setPosition(spec.x, spec.y)
    .setSize(spec.width, spec.height)
    .setFillStyle(0xe85d4c, debug ? 0.28 : 0)
    .setDepth(23)
    .setAlpha(1)
    .setVisible(debug)
    .setActive(true);
  rect.body?.setEnable(true);
  rect.body?.setImmovable(true);
  rect.body?.setSize(spec.width, spec.height);
  rect.body?.updateFromGameObject();
  return rect;
}

export function releaseHitbox(rect) {
  rect?.setData?.("hit", undefined);
  releaseGameObject(rect);
}

export function pooledEffectsDisabled() {
  return prefersReducedMotion();
}
