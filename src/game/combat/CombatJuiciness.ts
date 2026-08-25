/**
 * CombatJuiciness.ts — South Florida Fighter
 *
 * Centralised "game feel" module. All camera, hitstop, timescale, flash,
 * and particle effects live here. Import and call from CombatSystem.ts;
 * nothing in this file touches FSM states or combo counters.
 */
import {
  spawnPooledRing,
  spawnPooledSparks,
} from "../PerformanceOptimizations.js";

export type HitTier = "light" | "heavy" | "super" | "parry" | "block";

const SPARK_COLORS: Record<HitTier, number[]> = {
  light:  [0xffe600, 0xff8c00, 0xffffff],
  heavy:  [0xe85d4c, 0xff2200, 0xffe600],
  super:  [0xd53f8c, 0xff00ff, 0xffffff, 0x00f0ff],
  parry:  [0x00f0ff, 0x00ffcc, 0xffffff],
  block:  [0x88ccff, 0x4488ff, 0xffffff],
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function framesToSec(frames: number): number {
  return frames / 60;
}

export function hitstopDuration(tier: HitTier): number {
  switch (tier) {
    case "light":  return framesToSec(5);
    case "heavy":  return framesToSec(9);
    case "super":  return framesToSec(13);
    case "parry":  return framesToSec(7);
    case "block":  return framesToSec(3);
  }
}

export function applyTimescaleRamp(scene: Phaser.Scene, tier: HitTier) {
  if (prefersReducedMotion()) return;
  if (tier === "block") return;

  scene.time.timeScale = 0.8;
  scene.tweens.addCounter({
    from: 0.8,
    to: 1.0,
    duration: 83,
    ease: "Quad.easeOut",
    onUpdate: (tween) => {
      scene.time.timeScale = tween.getValue() ?? 1.0;
    },
    onComplete: () => {
      scene.time.timeScale = 1.0;
    },
  });
}

interface ZoomProfile {
  target: number;
  inMs: number;
  ease: string;
}

const ZOOM_PROFILES: Record<HitTier, ZoomProfile> = {
  light: { target: 1.03, inMs:  80, ease: "Quad.easeOut"   },
  heavy: { target: 1.08, inMs: 120, ease: "Cubic.easeInOut" },
  super: { target: 1.15, inMs: 200, ease: "Expo.easeOut"    },
  parry: { target: 1.06, inMs: 100, ease: "Back.easeOut"    },
  block: { target: 1.02, inMs:  60, ease: "Quad.easeOut"    },
};

export function applyCameraZoom(scene: Phaser.Scene, tier: HitTier) {
  if (prefersReducedMotion()) return;
  const { target, inMs, ease } = ZOOM_PROFILES[tier];
  const cam = scene.cameras.main;
  cam.zoomTo(target, inMs, ease, true, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
    if (progress === 1) {
      const outMs = inMs * (tier === "super" ? 1.8 : 1.4);
      cam.zoomTo(1.0, outMs, "Quad.easeIn");
    }
  });
}

interface ShakeProfile {
  intensity: number;
  duration: number;
}

const SHAKE_PROFILES: Record<HitTier, ShakeProfile> = {
  light: { intensity: 0.003, duration:  60 },
  heavy: { intensity: 0.008, duration: 120 },
  super: { intensity: 0.012, duration: 250 },
  parry: { intensity: 0.006, duration: 100 },
  block: { intensity: 0.002, duration:  50 },
};

export function applyShake(scene: Phaser.Scene, tier: HitTier) {
  if (prefersReducedMotion()) return;
  const { intensity, duration } = SHAKE_PROFILES[tier];
  scene.cameras.main.shake(duration, intensity);
}

export function applyImpactFlash(scene: Phaser.Scene, tier: HitTier) {
  if (prefersReducedMotion()) return;
  if (tier !== "heavy" && tier !== "super") return;

  const cam = scene.cameras.main;
  const alpha = tier === "super" ? 0.14 : 0.08;
  const color = tier === "super" ? 0xd53f8c : 0xffffff;

  const flash = scene.add
    .rectangle(cam.scrollX, cam.scrollY, cam.width, cam.height, color, alpha)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(100)
    .setBlendMode(Phaser.BlendModes.ADD);

  scene.tweens.add({
    targets: flash,
    alpha: 0,
    delay: 16,
    duration: tier === "super" ? 80 : 48,
    ease: "Quad.easeOut",
    onComplete: () => flash.destroy(),
  });
}

export function applySuperWhiteFlash(scene: Phaser.Scene) {
  if (prefersReducedMotion()) return;
  const cam = scene.cameras.main;

  const wb = scene.add
    .rectangle(cam.scrollX, cam.scrollY, cam.width, cam.height, 0xffffff, 1)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(101);

  scene.tweens.add({
    targets: wb,
    alpha: 0,
    delay: 33,
    duration: 120,
    ease: "Expo.easeOut",
    onComplete: () => wb.destroy(),
  });
}

export function spawnJuicySparks(
  scene: Phaser.Scene,
  x: number,
  y: number,
  tier: HitTier,
  opts: { count?: number; color?: number } = {},
) {
  const palette = SPARK_COLORS[tier];
  const count   = opts.count ?? (tier === "super" ? 18 : tier === "heavy" ? 12 : 8);
  const baseSpd = tier === "super" ? 500 : tier === "heavy" ? 380 : 240;

  spawnPooledSparks(scene, x, y, {
    color: opts.color ?? palette,
    count,
    depth: 46,
    length: tier === "super" ? 22 : tier === "heavy" ? 16 : 10,
    lineWidth: tier === "super" ? 3.5 : tier === "heavy" ? 2.5 : 2,
    minSpeed: baseSpd * 0.4,
    maxSpeed: baseSpd,
    duration: tier === "super" ? 300 : 220,
    withDots: true,
  });

  if (tier === "heavy" || tier === "super") {
    const ringColor = tier === "super" ? 0xd53f8c : 0xffe600;
    spawnPooledRing(scene, x, y, ringColor, {
      scale: tier === "super" ? 4.5 : 3,
      lineWidth: tier === "super" ? 3 : 2,
      duration: tier === "super" ? 260 : 180,
      depth: 45,
    });
  }
}

let _rampScheduled = false;

export function scheduleTimescaleRamp(
  scene: Phaser.Scene,
  freezeSec: number,
  tier: HitTier,
) {
  if (prefersReducedMotion()) return;
  if (_rampScheduled) return;

  _rampScheduled = true;
  scene.time.delayedCall(freezeSec * 1000 + 8, () => {
    _rampScheduled = false;
    applyTimescaleRamp(scene, tier);
  });
}

export interface JuiceHitOptions {
  tier: HitTier;
  hitX: number;
  hitY: number;
  freezeSec: number;
  sparkColor?: number;
}

export function applyJuiceHit(scene: Phaser.Scene, opts: JuiceHitOptions) {
  const { tier, hitX, hitY, freezeSec, sparkColor } = opts;

  spawnJuicySparks(scene, hitX, hitY, tier, { color: sparkColor });
  applyCameraZoom(scene, tier);
  applyShake(scene, tier);
  applyImpactFlash(scene, tier);

  if (tier === "super") applySuperWhiteFlash(scene);

  scheduleTimescaleRamp(scene, freezeSec, tier);
}
