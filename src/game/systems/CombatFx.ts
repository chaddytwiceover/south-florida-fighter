import type { GameObjects, Physics, Scene } from "phaser";

export function playSlash(scene: Scene, x: number, y: number, facing: number) {
  if (!scene.textures.exists("slash-fx")) return;
  const fx = scene.add.sprite(x + facing * 54, y - 52, "slash-fx", 0);
  fx.setOrigin(0.5, 0.5);
  fx.setScale(1.15);
  fx.setFlipX(facing < 0);
  fx.setDepth(24);
  if (scene.anims.exists("slash-fx")) fx.play("slash-fx");
  scene.time.delayedCall(280, () => fx.destroy());
}

export function playWave(scene: Scene, x: number, y: number, facing: number) {
  if (!scene.textures.exists("wave-fx")) return null;
  const bolt = scene.physics.add.sprite(x + facing * 42, y - 58, "wave-fx", 0);
  bolt.setOrigin(0.5, 0.5);
  bolt.setScale(0.95);
  bolt.setFlipX(facing < 0);
  bolt.setDepth(22);
  bolt.setVelocity(facing * 520, 0);
  const body = bolt.body as Physics.Arcade.Body | null;
  body?.setAllowGravity(false);
  if (scene.anims.exists("wave-fx")) bolt.play("wave-fx");
  scene.time.delayedCall(900, () => {
    if (bolt.active) bolt.destroy();
  });
  return bolt;
}

export function playImpact(scene: Scene, x: number, y: number) {
  if (!scene.textures.exists("impact-fx")) return;
  const fx = scene.add.sprite(x, y, "impact-fx", 0);
  fx.setOrigin(0.5, 0.5);
  fx.setScale(0.95);
  fx.setDepth(25);
  if (scene.anims.exists("impact-fx")) fx.play("impact-fx");
  else scene.time.delayedCall(220, () => fx.destroy());
  fx.once("animationcomplete", () => fx.destroy());
}

export function playClone(scene: Scene, source: GameObjects.Sprite) {
  const ghost = scene.add.sprite(source.x, source.y, source.texture.key, source.frame.name);
  ghost.setOrigin(source.originX, source.originY);
  ghost.setScale(source.scaleX, source.scaleY);
  ghost.setFlipX(source.flipX);
  ghost.setAlpha(0.42);
  ghost.setTint(0x7a3cff);
  ghost.setDepth(source.depth - 1);
  scene.tweens.add({
    targets: ghost,
    alpha: 0,
    duration: 900,
    ease: "Quad.easeIn",
    onComplete: () => ghost.destroy(),
  });
}

export function createFxAnimations(scene: Scene) {
  if (scene.textures.exists("slash-fx") && !scene.anims.exists("slash-fx")) {
    scene.anims.create({
      key: "slash-fx",
      frames: scene.anims.generateFrameNumbers("slash-fx", { start: 0, end: 3 }),
      frameRate: 18,
      repeat: 0,
    });
  }
  if (scene.textures.exists("wave-fx") && !scene.anims.exists("wave-fx")) {
    scene.anims.create({
      key: "wave-fx",
      frames: scene.anims.generateFrameNumbers("wave-fx", { start: 0, end: 3 }),
      frameRate: 14,
      repeat: -1,
    });
  }
  if (scene.textures.exists("impact-fx") && !scene.anims.exists("impact-fx")) {
    scene.anims.create({
      key: "impact-fx",
      frames: scene.anims.generateFrameNumbers("impact-fx", { start: 0, end: 3 }),
      frameRate: 18,
      repeat: 0,
    });
  }
}
