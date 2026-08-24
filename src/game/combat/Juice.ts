import { COMBAT } from "../config";

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
  const label = scene.add
    .text(x, y, text, {
      fontFamily: "Bebas Neue, Impact, sans-serif",
      fontSize: size,
      color,
      stroke: "#0c1a24",
      strokeThickness: 6,
    })
    .setOrigin(0.5, 1)
    .setDepth(50);

  label.setScale(0.7);
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
        onComplete: () => label.destroy(),
      });
    },
  });
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
) {
  sprite.setTintFill(tint);
  sprite.scene.time.delayedCall(durationMs, () => {
    if (sprite.active) sprite.clearTint();
  });
}

export function spawnHitSparks(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color = 0xffe600,
  count = 8,
) {
  for (let i = 0; i < count; i++) {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const speed = Phaser.Math.FloatBetween(120, 380);
    const line = scene.add.line(
      x,
      y,
      0,
      0,
      Math.cos(angle) * 14,
      Math.sin(angle) * 14,
      color,
    );
    line.setLineWidth(3);
    line.setDepth(45);

    scene.tweens.add({
      targets: line,
      x: x + Math.cos(angle) * (speed * 0.15),
      y: y + Math.sin(angle) * (speed * 0.15),
      alpha: 0,
      scaleX: 0.2,
      duration: 200,
      ease: "Quad.easeOut",
      onComplete: () => line.destroy(),
    });
  }
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
