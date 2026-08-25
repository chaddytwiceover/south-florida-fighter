import type { GameObjects, Physics, Scene } from "phaser";
import {
  acquirePooledProjectile,
  createOptimizedAnimation,
  releaseProjectile,
  resolveClipTexture,
} from "../PerformanceOptimizations.js";

const FX_CLIPS = {
  slash: { key: "slash-fx", textureKey: "slash-fx", frames: 4, frameRate: 18, repeat: 0 },
  wave: { key: "wave-fx", textureKey: "wave-fx", frames: 4, frameRate: 14, repeat: -1 },
  impact: { key: "impact-fx", textureKey: "impact-fx", frames: 4, frameRate: 18, repeat: 0 },
} as const;

export function playSlash(scene: Scene, x: number, y: number, facing: number) {
  const texture = resolveClipTexture(scene, FX_CLIPS.slash, 0);
  if (!scene.textures.exists(texture.key)) return;
  const fx = scene.add.sprite(x + facing * 54, y - 52, texture.key, texture.frame);
  fx.setOrigin(0.5, 0.5);
  fx.setScale(1.15);
  fx.setFlipX(facing < 0);
  fx.setDepth(24);
  if (scene.anims.exists("slash-fx")) fx.play("slash-fx");
  scene.time.delayedCall(280, () => fx.destroy());
}

export function playWave(scene: Scene, x: number, y: number, facing: number) {
  const bolt = acquirePooledProjectile(scene, x, y, facing);
  if (!bolt) return null;
  const body = bolt.body as Physics.Arcade.Body | null;
  body?.setAllowGravity(false);
  scene.time.delayedCall(900, () => {
    releaseProjectile(bolt);
  });
  return bolt;
}

export function playImpact(scene: Scene, x: number, y: number) {
  const texture = resolveClipTexture(scene, FX_CLIPS.impact, 0);
  if (!scene.textures.exists(texture.key)) return;
  const fx = scene.add.sprite(x, y, texture.key, texture.frame);
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
  createOptimizedAnimation(scene, FX_CLIPS.slash);
  createOptimizedAnimation(scene, FX_CLIPS.wave);
  createOptimizedAnimation(scene, FX_CLIPS.impact);
}
