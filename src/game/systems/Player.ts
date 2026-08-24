import type { CharacterData, MoveData } from "../characters/CharacterData";
import type { CombatSystem } from "../combat/CombatSystem";
import { flashSprite } from "../combat/Juice";
import { COMBAT, GROUND_Y, JUMP, MOVE, PLAYER_BODY, PLAYER_DISPLAY_SCALE, WORLD_WIDTH } from "../config";
import type { GameActions } from "../input/InputManager";
import { playClone, playSlash, playWave } from "./CombatFx";
import { useGameStore } from "./gameStore";
import { approach } from "../utils/math";
import { audioManager } from "../audio/AudioManager";

const COMBO_WINDOW = COMBAT.comboWindow;
const DASH_SPEED = 640;

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly character: CharacterData;
  facing = 1;
  grounded = false;
  spawn = { x: 0, y: 0 };

  private combat: CombatSystem | null = null;
  private coyote = 0;
  private buffer = 0;
  private jumpHeld = false;
  private wasGrounded = false;
  private jumping = false;
  private actionLock = 0;
  private combo = 0;
  private comboWindow = 0;
  private specialIndex = 0;
  private attackBuffered = false;
  private specialBuffered = false;
  private bufferedSlot: number | null = null;
  private playingMove: MoveData | null = null;
  private iFrames = 0;
  private hurtLock = 0;
  private recovering = false;

  constructor(scene: Phaser.Scene, x: number, y: number, character: CharacterData) {
    this.character = character;
    this.spawn = { x, y };
    this.sprite = scene.physics.add.sprite(x, y, character.animationSet.idle.textureKey, 0);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(PLAYER_DISPLAY_SCALE);
    this.sprite.setDepth(20);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(Math.max(character.movementSpeed, DASH_SPEED), JUMP.terminal);
    body.setDrag(0, 0);
    body.setFriction(0, 0);
    body.setBounce(0, 0);
    body.setAllowGravity(false);
    body.setAllowGravity(false);
    body.setSize(PLAYER_BODY.width, PLAYER_BODY.height);
    body.setOffset(PLAYER_BODY.offsetX, PLAYER_BODY.offsetY);
    body.pushable = false;
    body.moves = false;

    this.sprite.play(character.animationSet.idle.key);
  }

  bindCombat(combat: CombatSystem) {
    this.combat = combat;
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  get vx() {
    return (this.sprite.body as Phaser.Physics.Arcade.Body).velocity.x;
  }

  get vy() {
    return (this.sprite.body as Phaser.Physics.Arcade.Body).velocity.y;
  }

  takeHit(damage: number, knockbackX: number) {
    if (this.iFrames > 0 || this.recovering) return false;
    const store = useGameStore.getState();
    const health = Math.max(0, store.health - damage);
    store.setHealth(health);
    this.iFrames = COMBAT.playerIFramesMs / 1000;
    this.hurtLock = 0.34;
    this.clearMove();
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(knockbackX, -90);
    flashSprite(this.sprite, 0xffffff);
    this.playHurt();
    audioManager.hurt();
    if (health <= 0) this.knockOut();
    return true;
  }

  update(actions: GameActions, dt: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const vyNow = body.velocity.y;
    const onFloor =
      body.blocked.down ||
      body.touching.down ||
      (vyNow >= -12 && this.sprite.y >= GROUND_Y - 4 && this.sprite.y <= GROUND_Y + 18);
    this.grounded = onFloor;

    if (this.iFrames > 0) {
      this.iFrames = Math.max(0, this.iFrames - dt);
      this.sprite.setAlpha(0.45 + 0.55 * Math.abs(Math.sin(this.iFrames * 24)));
    } else {
      this.sprite.setAlpha(1);
    }
    if (this.hurtLock > 0) this.hurtLock = Math.max(0, this.hurtLock - dt);

    if (onFloor) this.coyote = JUMP.coyoteMs / 1000;
    else this.coyote = Math.max(0, this.coyote - dt);

    if (actions.jumpPressed) this.buffer = JUMP.bufferMs / 1000;
    else this.buffer = Math.max(0, this.buffer - dt);

    if (actions.jumpPressed) this.jumpHeld = true;
    if (!actions.jump) this.jumpHeld = false;

    if (this.actionLock > 0) this.actionLock = Math.max(0, this.actionLock - dt);
    if (this.comboWindow > 0) this.comboWindow = Math.max(0, this.comboWindow - dt);
    else this.combo = 0;

    const stunned = this.hurtLock > 0 || this.recovering;
    const occupy = this.actionLock > 0 && this.playingMove;
    const freezeWalk =
      stunned ||
      (Boolean(occupy) &&
        (this.playingMove?.effect === "dash" ||
          this.playingMove?.effect === "finisher" ||
          this.playingMove?.effect === "projectile" ||
          this.playingMove?.effect === "clone"));
    const speed = this.character.movementSpeed;
    const accel = onFloor ? MOVE.accel : MOVE.airAccel;
    const friction = onFloor ? MOVE.friction : MOVE.airFriction;
    let vx = body.velocity.x;
    const dashing = this.playingMove?.effect === "dash" && this.actionLock > 0;
    if (!dashing) {
      if (Math.abs(actions.moveX) > 0.12 && !freezeWalk) {
        vx = approach(vx, actions.moveX * speed, accel * dt);
      } else {
        vx = approach(vx, 0, friction * dt);
      }
    }
    this.sprite.x += vx * dt;
    this.sprite.x = Math.max(40, Math.min(WORLD_WIDTH - 40, this.sprite.x));
    body.setVelocityX(vx);

    if (!freezeWalk) {
      if (actions.moveX > 0.15) this.facing = 1;
      else if (actions.moveX < -0.15) this.facing = -1;
    }
    this.sprite.setFlipX(this.facing < 0);

    let vy = body.velocity.y;
    const canJump = this.coyote > 0 && !this.jumping && !stunned;
    if (this.buffer > 0 && canJump) {
      vy = JUMP.velocity;
      this.buffer = 0;
      this.coyote = 0;
      this.jumping = true;
      this.jumpHeld = true;
      this.clearMove();
      audioManager.jump();
    }

    if (this.jumping && !this.jumpHeld && vy < 0) {
      vy *= JUMP.cutMultiplier;
      this.jumping = false;
    }

    let gravity = vy < 0 ? JUMP.riseGravity : JUMP.fallGravity;
    if (Math.abs(vy) < JUMP.apexWindow) gravity *= JUMP.apexHang;
    vy = Math.min(vy + gravity * dt, JUMP.terminal);

    if (onFloor) {
      if (vy > 0) vy = 0;
      this.jumping = false;
      if (!this.wasGrounded && this.vy > 120) audioManager.land();
    }

    this.sprite.y += vy * dt;
    if (onFloor && this.sprite.y > GROUND_Y) this.sprite.y = GROUND_Y;
    body.setVelocityY(vy);
    body.updateFromGameObject();
    this.wasGrounded = onFloor;

    if (!stunned) {
      if (actions.attackPressed) this.attackBuffered = true;
      if (actions.specialPressed) this.specialBuffered = true;
      if (actions.specialSlot !== null) {
        this.specialBuffered = true;
        this.bufferedSlot = actions.specialSlot;
      }

      if (this.actionLock <= 0) {
        if (this.attackBuffered) {
          this.attackBuffered = false;
          this.startAttack();
        } else if (this.specialBuffered) {
          this.specialBuffered = false;
          const slot = this.bufferedSlot;
          this.bufferedSlot = null;
          this.startSpecial(slot);
        }
      }
    }

    useGameStore.getState().rechargeKi(8 * dt);
    this.updateAnimation(onFloor, vx, vy);
  }

  private startAttack() {
    const step = this.comboWindow > 0 ? Math.min(this.combo, 2) : 0;
    const move = this.character.attacks[step];
    this.combo = step + 1;
    this.comboWindow = COMBO_WINDOW;
    this.playMove(move);
  }

  private startSpecial(slot: number | null) {
    const store = useGameStore.getState();
    if (store.energy >= 100) {
      this.playMove(this.character.finisher);
      store.spendKi(this.character.finisher.kiCost);
      store.gainXp(20);
      this.combo = 0;
      this.comboWindow = 0;
      return;
    }
    const index = slot !== null ? Math.max(0, Math.min(2, slot)) : this.specialIndex;
    const move = this.character.specials[index];
    if (store.energy < move.kiCost) {
      useGameStore.setState({ flash: "Need more KI" });
      return;
    }
    store.spendKi(move.kiCost);
    store.gainXp(10);
    this.playMove(move);
    this.specialIndex = (index + 1) % 3;
    useGameStore.setState({ specialIndex: this.specialIndex });
    this.combo = 0;
    this.comboWindow = 0;
  }

  private playMove(move: MoveData) {
    this.playingMove = move;
    this.actionLock = move.durationMs / 1000;
    useGameStore.setState({ currentMove: move.name, flash: "" });
    const clip = this.character.animationSet[move.anim];
    this.sprite.anims.stop();
    this.sprite.setTexture(clip.textureKey, 0);
    this.sprite.play(clip.key);

    const scene = this.sprite.scene;
    const delay =
      move.anim === "light" ? 70 : move.anim === "heavy" ? 140 : move.anim === "finisher" ? 200 : 110;

    if (move.effect === "melee" || move.effect === "finisher") {
      playSlash(scene, this.x, this.y, this.facing);
      audioManager.attack();
      scene.time.delayedCall(delay, () => {
        if (this.playingMove !== move) return;
        this.combat?.spawnHit({
          x: this.x + this.facing * (move.effect === "finisher" ? 70 : 62),
          y: this.y - 48,
          width: move.effect === "finisher" ? 160 : 110,
          height: 96,
          damage: move.damage,
          knockback: move.effect === "finisher" ? 460 : 260,
          faction: "player",
          durationMs: move.effect === "finisher" ? 200 : 140,
        });
      });
    }
    if (move.effect === "projectile") {
      audioManager.special();
      scene.time.delayedCall(120, () => {
        if (this.playingMove !== move) return;
        const bolt = playWave(scene, this.x, this.y, this.facing);
        if (bolt) {
          this.combat?.armProjectile(bolt, {
            damage: move.damage,
            knockback: 320,
            faction: "player",
            durationMs: 900,
          });
        }
      });
    }
    if (move.effect === "dash") {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(this.facing * DASH_SPEED);
      audioManager.whoosh();
      this.combat?.spawnHit({
        x: this.x + this.facing * 40,
        y: this.y - 50,
        width: 70,
        height: 64,
        damage: move.damage,
        knockback: 300,
        faction: "player",
        durationMs: move.durationMs,
        follow: this.sprite,
        followOffsetX: 40,
        followOffsetY: -50,
      });
    }
    if (move.effect === "clone") {
      playClone(scene, this.sprite);
      audioManager.special();
    }
    if (move.effect === "finisher") audioManager.finisher();
  }

  private playHurt() {
    const clip = this.character.animationSet.hurt;
    this.sprite.anims.stop();
    this.sprite.setTexture(clip.textureKey, 0);
    this.sprite.play(clip.key);
  }

  private knockOut() {
    this.recovering = true;
    this.clearMove();
    this.hurtLock = 1.1;
    useGameStore.setState({ flash: "KO — get up" });
    this.sprite.scene.time.delayedCall(1100, () => {
      if (!this.sprite.active) return;
      this.sprite.setPosition(this.spawn.x, this.spawn.y);
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      useGameStore.getState().setHealth(this.character.health);
      this.iFrames = 1.2;
      this.hurtLock = 0;
      this.recovering = false;
      useGameStore.setState({ flash: "" });
    });
  }

  private clearMove() {
    this.playingMove = null;
    this.actionLock = 0;
    this.attackBuffered = false;
    this.specialBuffered = false;
    this.bufferedSlot = null;
    useGameStore.setState({ currentMove: "" });
  }

  private updateAnimation(onFloor: boolean, vx: number, vy: number) {
    if (this.hurtLock > 0 || this.recovering) return;
    if (this.actionLock > 0 && this.playingMove) return;

    if (this.playingMove && this.actionLock <= 0) {
      this.playingMove = null;
      useGameStore.setState({ currentMove: "" });
    }

    const set = this.character.animationSet;
    if (!onFloor) {
      const frame = vy < -80 ? 1 : 3;
      this.sprite.anims.stop();
      if (this.sprite.texture.key !== set.jump.textureKey) {
        this.sprite.setTexture(set.jump.textureKey, frame);
      } else {
        this.sprite.setFrame(frame);
      }
      return;
    }

    const running = Math.abs(vx) > 28;
    const key = running ? set.run.key : set.idle.key;
    if (this.sprite.anims.currentAnim?.key !== key || !this.sprite.anims.isPlaying) {
      this.sprite.play(key, true);
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}
