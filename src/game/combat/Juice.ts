import { COMBAT } from "../config";
import {
  spawnPooledFloatText,
  spawnPooledSparks,
} from "../PerformanceOptimizations.js";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function floatText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color: string,
  size = "32px",
) {
  spawnPooledFloatText(scene, x, y, text, color, size);
}

export function shakeCamera(
  scene: Phaser.Scene,
  intensity: number = COMBAT.shake,
  duration = 140,
) {
  if (prefersReducedMotion()) return;
  scene.cameras.main.shake(duration, intensity);
}

export function cameraZoomPunch(
  scene: Phaser.Scene,
  targetZoom = 1.06,
  duration = 160,
) {
  if (prefersReducedMotion()) return;
  scene.cameras.main.zoomTo(targetZoom, duration * 0.4, "Quad.easeOut", true, (_cam, progress) => {
    if (progress === 1) {
      scene.cameras.main.zoomTo(1.0, duration * 0.6, "Quad.easeIn");
    }
  });
}

export function flashSprite(
  sprite: Phaser.GameObjects.Sprite,
  tint = 0xffffff,
  durationMs = 70,
  baseTint?: number,
) {
  sprite.setTintFill(tint);
  sprite.scene.time.delayedCall(durationMs, () => {
    if (sprite.active) {
      if (baseTint !== undefined) {
        sprite.setTint(baseTint);
      } else {
        sprite.clearTint();
      }
    }
  });
}

export function spawnHitSparks(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color = 0xffe600,
  count = 8,
) {
  spawnPooledSparks(scene, x, y, { color, count, depth: 45 });
}

export function applySquashStretch(
  sprite: Phaser.GameObjects.Sprite,
  baseScaleX: number,
  baseScaleY: number,
  squashX: number,
  squashY: number,
  duration = 100,
) {
  const currentFacing = Math.sign(baseScaleX) || 1;
  sprite.setScale(Math.abs(baseScaleX) * squashX * currentFacing, baseScaleY * squashY);
  sprite.scene.tweens.add({
    targets: sprite,
    scaleX: Math.abs(baseScaleX) * currentFacing,
    scaleY: baseScaleY,
    duration,
    ease: "Quad.easeOut",
  });
}
