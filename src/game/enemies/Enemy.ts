import type { CombatSystem } from "../combat/CombatSystem";
import { flashSprite, spawnHitSparks } from "../combat/Juice";
import { ENEMY_BODY, ENEMY_DISPLAY_SCALE, GROUND_Y, JUMP } from "../config";
import { audioManager } from "../audio/AudioManager";
import type { EnemyData } from "./EnemyData";
import { approach } from "../utils/math";
import {
  resolveClipTexture,
  setSpriteClipFrame,
} from "../PerformanceOptimizations.js";

type EnemyState = "idle" | "patrol" | "chase" | "attack" | "hurt" | "dead";

export class Enemy {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly data: EnemyData;
  readonly id: string;
  health: number;
  facing = -1;
  dead = false;

  private state: EnemyState = "idle";
  private homeX: number;
  private iFrames = 0;
  private hurtLock = 0;
  private attackLock = 0;
  private cooldown = 0.4;
  private patrolDir = 1;
  private hpBg: Phaser.GameObjects.Rectangle;
  private hpFill: Phaser.GameObjects.Rectangle;
  private struck = false;
  private phase2 = false;

  constructor(scene: Phaser.Scene, x: number, y: number, data: EnemyData) {
    this.data = data;
    this.id = `${data.id}-${Math.round(x)}-${Math.round(Math.random() * 999)}`;
    this.health = data.health;
    this.homeX = x;

    const isBoss = data.behaviorType === "boss";
    const scale = isBoss ? ENEMY_DISPLAY_SCALE * 1.3 : ENEMY_DISPLAY_SCALE;

    const initialTexture = resolveClipTexture(scene, data.animationSet.idle, 0);
    this.sprite = scene.physics.add.sprite(
      x,
      y,
      initialTexture.key,
      initialTexture.frame,
    );
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(scale);
    this.sprite.setDepth(18);
    this.sprite.setData("enemy", this);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(data.speed + 80, JUMP.terminal);
    body.setAllowGravity(false);
    body.setDrag(0, 0);
    body.setFriction(0, 0);
    body.setBounce(0, 0);
    body.setSize(
      isBoss ? ENEMY_BODY.width * 1.4 : ENEMY_BODY.width,
      isBoss ? ENEMY_BODY.height * 1.3 : ENEMY_BODY.height,
    );
    body.setOffset(
      isBoss ? ENEMY_BODY.offsetX * 1.2 : ENEMY_BODY.offsetX,
      isBoss ? ENEMY_BODY.offsetY * 1.2 : ENEMY_BODY.offsetY,
    );
    body.pushable = false;
    body.moves = false;

    const hpW = isBoss ? 70 : 42;
    this.hpBg = scene.add
      .rectangle(x, y - 128, hpW + 4, 7, 0x0c1a24, 0.85)
      .setDepth(26);
    this.hpFill = scene.add
      .rectangle(x - hpW / 2, y - 128, hpW, 5, isBoss ? 0xe8c45a : 0xe85d4c, 1)
      .setOrigin(0, 0.5)
      .setDepth(27);

    this.sprite.play(data.animationSet.idle.key);
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  takeHit(damage: number, knockbackX: number, knockbackY = -80) {
    if (this.dead || this.iFrames > 0) return false;
    this.health = Math.max(0, this.health - damage);
    this.iFrames = this.data.behaviorType === "boss" ? 0.25 : 0.17;

    let isSuperHit = damage >= 45;
    let resistHitStun = this.data.hasSuperArmor && !isSuperHit;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    if (!resistHitStun) {
      this.hurtLock = this.data.behaviorType === "boss" ? 0.18 : 0.28;
      this.attackLock = 0;
      this.state = "hurt";
      this.cooldown = Math.max(this.cooldown, 0.35);

      let actualKnockbackX = this.data.behaviorType === "boss" ? knockbackX * 0.4 : knockbackX;
      let actualKnockbackY = this.data.behaviorType === "boss" ? -40 : knockbackY;
      body.setVelocity(actualKnockbackX, actualKnockbackY);
    }

    flashSprite(
      this.sprite,
      this.data.behaviorType === "boss" ? 0xff00ff : 0xffffff,
      70,
      this.phase2 ? 0xff5555 : undefined
    );
    if (!resistHitStun) {
      this.playClip("hurt");
    }
    this.refreshHp();
    audioManager.hurt();

    if (this.health <= 0) this.defeat();
    return true;
  }

  update(dt: number, playerX: number, playerY: number, combat: CombatSystem) {
    if (!this.sprite.active) return;

    if (this.data.behaviorType === "boss" && this.health <= this.data.health * 0.5 && !this.phase2 && !this.dead) {
      this.phase2 = true;
      this.hurtLock = 1.0;
      this.attackLock = 0;
      this.state = "attack";
      this.playClip("attack");
      this.sprite.setTint(0xff5555);

      this.sprite.scene.time.delayedCall(200, () => {
        if (!this.sprite.active || this.dead) return;
        combat.spawnHit({
          x: this.x,
          y: this.y - 10,
          width: 300,
          height: 120,
          damage: 30,
          knockback: 400,
          faction: "enemy",
          level: "unblockable",
          durationMs: 200,
          follow: this.sprite,
          followOffsetX: 0,
          followOffsetY: -10,
        });
        audioManager.finisher();
      });
    }

    const hpOffset = this.data.behaviorType === "boss" ? -145 : -128;
    this.hpBg.setPosition(this.x, this.y + hpOffset);
    const hpW = this.data.behaviorType === "boss" ? 70 : 42;
    this.hpFill.setPosition(this.x - hpW / 2, this.y + hpOffset);

    if (this.iFrames > 0) this.iFrames = Math.max(0, this.iFrames - dt);
    if (this.hurtLock > 0) this.hurtLock = Math.max(0, this.hurtLock - dt);
    if (this.attackLock > 0) this.attackLock = Math.max(0, this.attackLock - dt);
    if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - dt);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const vyNow = body.velocity.y;
    const onFloor =
      body.blocked.down ||
      body.touching.down ||
      (vyNow >= -12 &&
        this.sprite.y >= GROUND_Y - 4 &&
        this.sprite.y <= GROUND_Y + 18);
    let vy = vyNow;
    vy = Math.min(vy + JUMP.fallGravity * dt, JUMP.terminal);
    if (onFloor && vy > 0) vy = 0;

    if (this.dead) {
      this.sprite.y += vy * dt;
      body.setVelocity(body.velocity.x, vy);
      body.updateFromGameObject();
      return;
    }

    if (this.hurtLock > 0) {
      const vx = approach(body.velocity.x, 0, 1800 * dt);
      this.sprite.x += vx * dt;
      this.sprite.y += vy * dt;
      if (onFloor && this.sprite.y > GROUND_Y) this.sprite.y = GROUND_Y;
      body.setVelocity(vx, vy);
      body.updateFromGameObject();
      return;
    }

    const dist = Math.hypot(playerX - this.x, playerY - this.y);
    const dir = playerX > this.x ? 1 : -1;

    if (this.attackLock > 0) {
      const vx = approach(body.velocity.x, 0, 1800 * dt);
      this.sprite.x += vx * dt;
      this.sprite.y += vy * dt;
      if (onFloor && this.sprite.y > GROUND_Y) this.sprite.y = GROUND_Y;
      body.setVelocity(vx, vy);
      body.updateFromGameObject();
      return;
    }

    if (dist < this.data.attackRange && this.cooldown <= 0) {
      this.facing = dir;
      this.startAttack(combat);
      return;
    }

    if (dist < this.data.aggroRange) {
      this.state = "chase";
      this.facing = dir;
      const effectiveSpeed = this.phase2 ? this.data.speed * 1.5 : this.data.speed;
      const targetVx = dir * effectiveSpeed;
      const vx = approach(body.velocity.x, targetVx, 1600 * dt);
      this.sprite.x += vx * dt;
      this.sprite.y += vy * dt;
      if (onFloor && this.sprite.y > GROUND_Y) this.sprite.y = GROUND_Y;
      body.setVelocity(vx, vy);
      body.updateFromGameObject();
      this.sprite.setFlipX(this.facing < 0);
      this.playClip("run");
      return;
    }

    // Patrol home
    this.state = "patrol";
    const deltaHome = this.homeX - this.x;
    if (Math.abs(deltaHome) > 160) {
      this.patrolDir = deltaHome > 0 ? 1 : -1;
    }
    this.facing = this.patrolDir;
    const effectiveSpeed = this.phase2 ? this.data.speed * 1.5 : this.data.speed;
    const vx = approach(
      body.velocity.x,
      this.patrolDir * (effectiveSpeed * 0.45),
      800 * dt,
    );
    this.sprite.x += vx * dt;
    this.sprite.y += vy * dt;
    if (onFloor && this.sprite.y > GROUND_Y) this.sprite.y = GROUND_Y;
    body.setVelocity(vx, vy);
    body.updateFromGameObject();
    this.sprite.setFlipX(this.facing < 0);
    this.playClip("idle");
  }

  private startAttack(combat: CombatSystem) {
    this.state = "attack";
    this.attackLock = this.data.attackDurationMs / 1000;
    this.cooldown = this.data.attackCooldownMs / 1000;
    this.struck = false;
    this.sprite.setFlipX(this.facing < 0);
    this.playClip("attack");

    const isBoss = this.data.behaviorType === "boss";
    this.sprite.scene.time.delayedCall(this.data.attackDelayMs, () => {
      if (this.dead || this.hurtLock > 0) return;
      audioManager.swing(isBoss ? 0.7 : 1.1);
      const effectiveDamage = this.phase2 ? this.data.damage * 1.5 : this.data.damage;
      combat.spawnHit({
        x: this.x + this.facing * (isBoss ? 58 : 42),
        y: this.y - 48,
        width: isBoss ? 110 : 78,
        height: isBoss ? 96 : 74,
        damage: effectiveDamage,
        knockback: this.data.knockback,
        faction: "enemy",
        level: isBoss ? "overhead" : "mid",
        durationMs: 140,
        follow: this.sprite,
        followOffsetX: this.facing * (isBoss ? 58 : 42),
        followOffsetY: -48,
      });
    });
  }

  private playClip(action: "idle" | "run" | "attack" | "hurt") {
    const clip = this.data.animationSet[action];
    if (this.sprite.anims.currentAnim?.key === clip.key) return;
    this.sprite.anims.stop();
    setSpriteClipFrame(this.sprite, clip, 0);
    this.sprite.play(clip.key, true);
  }

  private refreshHp() {
    const hpW = this.data.behaviorType === "boss" ? 70 : 42;
    const pct = Math.max(0, this.health / this.data.health);
    this.hpFill.setSize(Math.round(hpW * pct), 5);
  }

  private defeat() {
    this.dead = true;
    this.state = "dead";
    this.hpBg.destroy();
    this.hpFill.destroy();
    this.playClip("hurt");

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(this.facing * -240, -180);

    this.sprite.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      y: this.sprite.y + 20,
      duration: 520,
      delay: 200,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.sprite.destroy();
      },
    });
  }
}
