import type { CombatSystem } from "../combat/CombatSystem";
import { flashSprite } from "../combat/Juice";
import { ENEMY_BODY, ENEMY_DISPLAY_SCALE, GROUND_Y, JUMP } from "../config";
import { audioManager } from "../audio/AudioManager";
import type { EnemyData } from "./EnemyData";
import { approach } from "../utils/math";

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

  constructor(scene: Phaser.Scene, x: number, y: number, data: EnemyData) {
    this.data = data;
    this.id = `${data.id}-${Math.round(x)}-${Math.round(Math.random() * 999)}`;
    this.health = data.health;
    this.homeX = x;

    this.sprite = scene.physics.add.sprite(x, y, data.animationSet.idle.textureKey, 0);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(ENEMY_DISPLAY_SCALE);
    this.sprite.setDepth(18);
    this.sprite.setData("enemy", this);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(data.speed + 80, JUMP.terminal);
    body.setAllowGravity(false);
    body.setDrag(0, 0);
    body.setFriction(0, 0);
    body.setBounce(0, 0);
    body.setSize(ENEMY_BODY.width, ENEMY_BODY.height);
    body.setOffset(ENEMY_BODY.offsetX, ENEMY_BODY.offsetY);
    body.pushable = false;
    body.moves = false;

    this.hpBg = scene.add.rectangle(x, y - 118, 42, 6, 0x0c1a24, 0.8).setDepth(26);
    this.hpFill = scene.add.rectangle(x - 19, y - 118, 38, 4, 0xe85d4c, 1).setOrigin(0, 0.5).setDepth(27);

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
    this.iFrames = 0.17;
    this.hurtLock = 0.28;
    this.attackLock = 0;
    this.state = "hurt";
    this.cooldown = Math.max(this.cooldown, 0.35);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(knockbackX, knockbackY);
    flashSprite(this.sprite, 0xffffff);
    this.playClip("hurt");
    this.refreshHp();
    audioManager.hurt();

    if (this.health <= 0) this.defeat();
    return true;
  }

  update(dt: number, playerX: number, playerY: number, combat: CombatSystem) {
    if (!this.sprite.active) return;
    this.hpBg.setPosition(this.x, this.y - 118);
    this.hpFill.setPosition(this.x - 19, this.y - 118);

    if (this.iFrames > 0) this.iFrames = Math.max(0, this.iFrames - dt);
    if (this.hurtLock > 0) this.hurtLock = Math.max(0, this.hurtLock - dt);
    if (this.attackLock > 0) this.attackLock = Math.max(0, this.attackLock - dt);
    if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - dt);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const vyNow = body.velocity.y;
    const onFloor =
      body.blocked.down ||
      body.touching.down ||
      (vyNow >= -12 && this.sprite.y >= GROUND_Y - 4 && this.sprite.y <= GROUND_Y + 18);
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

    if (this.attackLock > 0) {
      const vx = approach(body.velocity.x, 0, 2200 * dt);
      this.sprite.x += vx * dt;
      this.sprite.y += vy * dt;
      if (onFloor && this.sprite.y > GROUND_Y) this.sprite.y = GROUND_Y;
      body.setVelocity(vx, vy);
      body.updateFromGameObject();
      return;
    }

    const dx = playerX - this.x;
    const dist = Math.abs(dx);
    const verticalOk = Math.abs(playerY - this.y) < 140;

    let vx = body.velocity.x;
    if (dist < this.data.aggroRange && verticalOk) {
      this.facing = dx >= 0 ? 1 : -1;
      this.sprite.setFlipX(this.facing < 0);
      if (dist <= this.data.attackRange && this.cooldown <= 0 && onFloor) {
        this.startAttack(combat);
        body.setVelocity(0, vy);
        body.updateFromGameObject();
        return;
      }
      this.state = "chase";
      vx = approach(vx, this.facing * this.data.speed, 1600 * dt);
      this.sprite.x += vx * dt;
      this.sprite.y += vy * dt;
      if (onFloor && this.sprite.y > GROUND_Y) this.sprite.y = GROUND_Y;
      body.setVelocity(vx, vy);
      body.updateFromGameObject();
      this.playLoop("run");
      return;
    }

    this.state = "patrol";
    if (this.x > this.homeX + 160) this.patrolDir = -1;
    if (this.x < this.homeX - 160) this.patrolDir = 1;
    this.facing = this.patrolDir;
    this.sprite.setFlipX(this.facing < 0);
    vx = approach(vx, this.patrolDir * this.data.speed * 0.55, 900 * dt);
    this.sprite.x += vx * dt;
    this.sprite.y += vy * dt;
    if (onFloor && this.sprite.y > GROUND_Y) this.sprite.y = GROUND_Y;
    body.setVelocity(vx, vy);
    body.updateFromGameObject();
    this.playLoop("run");
  }

  private startAttack(combat: CombatSystem) {
    this.state = "attack";
    this.attackLock = this.data.attackDurationMs / 1000;
    this.cooldown = this.data.attackCooldownMs / 1000;
    this.struck = false;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);
    this.playClip("attack");
    audioManager.attack();

    this.sprite.scene.time.delayedCall(this.data.attackDelayMs, () => {
      if (this.dead || !this.sprite.active || this.struck) return;
      this.struck = true;
      combat.spawnHit({
        x: this.x + this.facing * 54,
        y: this.y - 50,
        width: this.data.behaviorType === "fast" ? 78 : 70,
        height: 62,
        damage: this.data.damage,
        knockback: this.data.knockback,
        faction: "enemy",
        durationMs: 120,
      });
    });
  }

  private defeat() {
    this.dead = true;
    this.state = "dead";
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    this.playClip("hurt");
    audioManager.defeat();
    this.sprite.scene.tweens.add({
      targets: [this.sprite, this.hpBg, this.hpFill],
      alpha: 0,
      y: `+=24`,
      duration: 420,
      ease: "Quad.easeIn",
      onComplete: () => this.destroy(),
    });
  }

  private refreshHp() {
    const pct = this.health / Math.max(1, this.data.health);
    this.hpFill.width = 38 * pct;
  }

  private playLoop(name: "idle" | "run") {
    const key = this.data.animationSet[name].key;
    if (this.sprite.anims.currentAnim?.key !== key || !this.sprite.anims.isPlaying) {
      this.sprite.play(key, true);
    }
  }

  private playClip(name: "attack" | "hurt") {
    const clip = this.data.animationSet[name];
    this.sprite.anims.stop();
    this.sprite.setTexture(clip.textureKey, 0);
    this.sprite.play(clip.key);
  }

  destroy() {
    this.hpBg.destroy();
    this.hpFill.destroy();
    this.sprite.destroy();
  }
}
