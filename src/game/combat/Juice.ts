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
) {
  const label = scene.add
    .text(x, y, text, {
      fontFamily: "Bebas Neue, Impact, sans-serif",
      fontSize: "30px",
      color,
      stroke: "#0c1a24",
      strokeThickness: 5,
    })
    .setOrigin(0.5, 1)
    .setDepth(40);
  scene.tweens.add({
    targets: label,
    y: y - 54,
    alpha: 0,
    duration: 560,
    ease: "Quad.easeOut",
    onComplete: () => label.destroy(),
  });
}

export function shakeCamera(scene: Phaser.Scene, intensity: number = COMBAT.shake) {
  if (prefersReducedMotion()) return;
  scene.cameras.main.shake(130, intensity);
}

export function flashSprite(sprite: Phaser.GameObjects.Sprite, tint = 0xffffff) {
  sprite.setTintFill(tint);
  sprite.scene.time.delayedCall(70, () => {
    if (sprite.active) sprite.clearTint();
  });
}
