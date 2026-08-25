import type { CharacterData } from "../characters/CharacterData";
import type { CombatSystem } from "../combat/CombatSystem";
import {
  CharacterStateMachine,
  type FighterState,
} from "../combat/CharacterStateMachine";
import {
  type CharacterFrameKit,
  type AttackFrameData,
  type AttackLevel,
  getFrameKit,
} from "../combat/FrameData";
import {
  applySquashStretch,
  flashSprite,
  spawnHitSparks,
} from "../combat/Juice";
import {
  COMBAT,
  GROUND_Y,
  JUMP,
  MOVE,
  PLAYER_BODY,
  PLAYER_DISPLAY_SCALE,
  WORLD_WIDTH,
} from "../config";
import type { GameActions } from "../input/InputManager";
import { InputBuffer, type BufferedCommand } from "../input/InputBuffer";
import { playClone, playSlash, playWave } from "./CombatFx";
import { useGameStore } from "./gameStore";
import { approach } from "../utils/math";
import { audioManager } from "../audio/AudioManager";

export type AttackResolution =
  | { type: "parry" }
  | { type: "block" }
  | { type: "hit" }
  | { type: "invulnerable" };

export class Player {
  readonly id: string = "player";
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly character: CharacterData;
  readonly frameKit: CharacterFrameKit;
  readonly fsm = new CharacterStateMachine();
  readonly inputBuffer = new InputBuffer();

  facing = 1;
  grounded = false;
  spawn = { x: 0, y: 0 };

  private combat: CombatSystem | null = null;
  private coyote = 0;
  private buffer = 0;
  private jumpHeld = false;
  private wasGrounded = false;
  private jumping = false;

  private currentAttack: AttackFrameData | null = null;
  private attackPhase: "startup" | "active" | "recovery" | null = null;
  private attackPhaseTimer = 0;
  private hitHasConnected = false;

  private iFrames = 0;
  private stunTimer = 0;
  private dashTimer = 0;
  private parryTimer = 0;
  private parryWindow = 0;
  private recovering = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    character: CharacterData,
  ) {
    this.character = character;
    this.frameKit = getFrameKit(character.id);
    this.spawn = { x, y };

    this.sprite = scene.physics.add.sprite(
      x,
      y,
      character.animationSet.idle.textureKey,
      0,
    );
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(PLAYER_DISPLAY_SCALE);
    this.sprite.setDepth(20);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(
      Math.max(character.movementSpeed, this.frameKit.dash.speed),
      JUMP.terminal,
    );
    body.setDrag(0, 0);
    body.setFriction(0, 0);
    body.setBounce(0, 0);
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

  receiveIncomingAttack(
    damage: number,
    chipDamage: number,
    knockbackX: number,
    attackLevel: AttackLevel,
  ): AttackResolution {
    if (this.iFrames > 0 || this.recovering || this.fsm.isInvulnerable()) {
      return { type: "invulnerable" };
    }

    // 1. Check Just-Parry
    if (this.parryWindow > 0) {
      this.fsm.changeState("PARRY_SUCCESS");
      this.parryTimer = 0.28;
      this.iFrames = 0.35;
      this.clearAttack();
      return { type: "parry" };
    }

    // 2. Check Guard / Block
    const isGuarding =
      this.fsm.currentState === "BLOCK_HIGH" ||
      this.fsm.currentState === "BLOCK_LOW";

    if (isGuarding && attackLevel !== "unblockable") {
      const isCrouchGuarding = this.fsm.currentState === "BLOCK_LOW";
      // High/Low mixup: Overhead beats low block, Low beats high block
      const guardBroken =
        (attackLevel === "overhead" && isCrouchGuarding) ||
        (attackLevel === "low" && !isCrouchGuarding);

      if (!guardBroken) {
        const store = useGameStore.getState();
        const health = Math.max(0, store.health - chipDamage);
        store.setHealth(health);
        this.fsm.changeState("BLOCK_STUN");
        this.stunTimer = 0.16;
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(knockbackX * 0.4, 0);
        return { type: "block" };
      }
    }

    // 3. Direct Hit Taken
    const store = useGameStore.getState();
    const health = Math.max(0, store.health - damage);
    store.setHealth(health);

    this.iFrames = COMBAT.playerIFramesMs / 1000;
    this.stunTimer = 0.34;
    this.fsm.changeState("HITSTUN");
    this.clearAttack();

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(knockbackX, -90);
    flashSprite(this.sprite, 0xffffff);
    this.playHurt();
    audioManager.hurt();

    if (health <= 0) this.knockOut();
    return { type: "hit" };
  }

  takeHit(damage: number, knockbackX: number) {
    const res = this.receiveIncomingAttack(damage, 3, knockbackX, "mid");
    return res.type === "hit" || res.type === "block";
  }

  update(actions: GameActions, dt: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const vyNow = body.velocity.y;
    const onFloor =
      body.blocked.down ||
      body.touching.down ||
      (vyNow >= -12 &&
        this.sprite.y >= GROUND_Y - 4 &&
        this.sprite.y <= GROUND_Y + 18);
    this.grounded = onFloor;

    // Push into input buffer
    this.inputBuffer.push(actions.raw, this.facing);

    // Update timers & iFrames
    if (this.iFrames > 0) {
      this.iFrames = Math.max(0, this.iFrames - dt);
      this.sprite.setAlpha(1);
      if (Math.sin(this.iFrames * 32) > 0) {
        this.sprite.setTint(0xbdefff);
      } else {
        this.sprite.clearTint();
      }
    } else {
      this.sprite.setAlpha(1);
      this.sprite.clearTint();
    }

    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - dt);
      if (this.stunTimer === 0 && this.fsm.currentState === "HITSTUN") {
        this.fsm.changeState(onFloor ? "IDLE" : "JUMP_FALL");
      }
    }

    if (this.parryWindow > 0) {
      this.parryWindow = Math.max(0, this.parryWindow - dt);
    }
    if (this.parryTimer > 0) {
      this.parryTimer = Math.max(0, this.parryTimer - dt);
      if (this.parryTimer === 0 && this.fsm.isParrying()) {
        this.fsm.changeState(onFloor ? "IDLE" : "JUMP_FALL");
      }
    }

    if (this.dashTimer > 0) {
      this.dashTimer = Math.max(0, this.dashTimer - dt);
      if (this.dashTimer === 0) {
        this.fsm.changeState(onFloor ? "IDLE" : "JUMP_FALL");
      }
    }

    // Jump buffer & coyote
    if (onFloor) this.coyote = JUMP.coyoteMs / 1000;
    else this.coyote = Math.max(0, this.coyote - dt);

    if (actions.jumpPressed) this.buffer = JUMP.bufferMs / 1000;
    else this.buffer = Math.max(0, this.buffer - dt);

    if (actions.jumpPressed) this.jumpHeld = true;
    if (!actions.jump) this.jumpHeld = false;

    // Movement & physics update
    this.fsm.tick(dt);
    this.updateMovement(actions, onFloor, dt);
    this.updateAttackPhase(dt);
    this.processInputQueue(actions);

    useGameStore.getState().rechargeKi(9 * dt);
    this.updateAnimation(onFloor);
  }

  private updateMovement(actions: GameActions, onFloor: boolean, dt: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const isStunned = this.stunTimer > 0 || this.recovering;
    const isAttacking = this.fsm.isAttacking();
    const isDashing =
      this.fsm.currentState === "DASH_FWD" ||
      this.fsm.currentState === "DASH_BACK";
    const isParrying = this.fsm.isParrying();

    // Horizontal Movement
    const speed = this.character.movementSpeed;
    const accel = onFloor ? MOVE.accel : MOVE.airAccel;
    const friction = onFloor ? MOVE.friction : MOVE.airFriction;
    let vx = body.velocity.x;

    if (!isDashing && !isStunned && !isAttacking && !isParrying) {
      // Guard Check (holding backward or guard button)
      const movingBack =
        (this.facing > 0 && actions.moveX < -0.15) ||
        (this.facing < 0 && actions.moveX > 0.15);

      if (actions.guard || (movingBack && onFloor)) {
        if (actions.moveY > 0.3) {
          this.fsm.changeState("BLOCK_LOW");
        } else {
          this.fsm.changeState("BLOCK_HIGH");
        }
        vx = approach(vx, 0, friction * dt);
      } else {
        if (Math.abs(actions.moveX) > 0.12) {
          vx = approach(vx, actions.moveX * speed, accel * dt);
          if (actions.moveX > 0.15) this.facing = 1;
          else if (actions.moveX < -0.15) this.facing = -1;

          if (onFloor) {
            this.fsm.changeState(actions.moveX * this.facing > 0 ? "WALK_FWD" : "WALK_BACK");
          }
        } else {
          vx = approach(vx, 0, friction * dt);
          if (onFloor && this.fsm.currentState !== "IDLE") {
            this.fsm.changeState("IDLE");
          }
        }
      }
    } else if (isDashing) {
      // Dash velocity 유지
      const dashDir = this.fsm.currentState === "DASH_FWD" ? this.facing : -this.facing;
      vx = dashDir * this.frameKit.dash.speed;
    } else {
      vx = approach(vx, 0, friction * dt);
    }

    this.sprite.x += vx * dt;
    this.sprite.x = Math.max(40, Math.min(WORLD_WIDTH - 40, this.sprite.x));
    body.setVelocityX(vx);
    this.sprite.setFlipX(this.facing < 0);

    // Vertical Jump & Gravity
    let vy = body.velocity.y;
    const canJump =
      this.coyote > 0 && !this.jumping && !isStunned && !isAttacking && !isParrying;

    if (this.buffer > 0 && canJump) {
      vy = JUMP.velocity;
      this.buffer = 0;
      this.coyote = 0;
      this.jumping = true;
      this.jumpHeld = true;
      this.fsm.changeState("JUMP_RISE");
      applySquashStretch(this.sprite, PLAYER_DISPLAY_SCALE, PLAYER_DISPLAY_SCALE, 0.75, 1.3, 120);
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
      if (!this.wasGrounded && this.vy > 120) {
        audioManager.land();
        applySquashStretch(this.sprite, PLAYER_DISPLAY_SCALE, PLAYER_DISPLAY_SCALE, 1.3, 0.75, 100);
      }
    } else {
      if (vy > 0 && this.fsm.currentState === "JUMP_RISE") {
        this.fsm.changeState("JUMP_FALL");
      }
    }

    this.sprite.y += vy * dt;
    if (onFloor && this.sprite.y > GROUND_Y) this.sprite.y = GROUND_Y;
    body.setVelocityY(vy);
    body.updateFromGameObject();
    this.wasGrounded = onFloor;
  }

  private processInputQueue(actions: GameActions) {
    if (this.stunTimer > 0 || this.recovering) return;

    const cmd = this.inputBuffer.peek();
    if (!cmd) return;

    // Check Parry Trigger
    if (cmd === "PARRY" && this.fsm.isNeutral()) {
      this.inputBuffer.consume("PARRY");
      this.startParry();
      return;
    }

    // Check Dash Triggers
    if (
      (cmd === "DASH_FWD" || cmd === "DASH_BACK") &&
      this.fsm.isNeutral()
    ) {
      this.inputBuffer.consume(cmd);
      this.startDash(cmd === "DASH_FWD");
      return;
    }

    // Check Attack Triggers & Cancel Rules
    const canStartAttack =
      this.fsm.isNeutral() ||
      (this.fsm.canCancel() && this.canCancelCurrentAttack(cmd));

    if (canStartAttack) {
      this.executeAttackCommand(cmd);
    }
  }

  private canCancelCurrentAttack(nextCmd: BufferedCommand): boolean {
    if (!this.currentAttack) return false;
    const cancelables = this.currentAttack.cancelableTo;

    if (nextCmd === "FINISHER") return cancelables.includes("finisher");
    if (
      nextCmd === "SPECIAL1" ||
      nextCmd === "SPECIAL2" ||
      nextCmd === "SPECIAL3"
    ) {
      return cancelables.includes("special");
    }
    if (nextCmd === "DASH_FWD" || nextCmd === "DASH_BACK") {
      return cancelables.includes("dash");
    }
    // Normal attack chain (Light -> Heavy -> Kick)
    if (this.currentAttack.id.endsWith("light") && (nextCmd === "HEAVY" || nextCmd === "KICK")) {
      return true;
    }
    if (this.currentAttack.id.endsWith("heavy") && nextCmd === "KICK") {
      return true;
    }
    return false;
  }

  private executeAttackCommand(cmd: BufferedCommand) {
    let attackData: AttackFrameData | null = null;
    let clipKey = "light";

    if (cmd === "LIGHT") {
      attackData = this.frameKit.light;
      clipKey = "light";
    } else if (cmd === "HEAVY") {
      attackData = this.frameKit.heavy;
      clipKey = "heavy";
    } else if (cmd === "KICK") {
      attackData = this.frameKit.kick;
      clipKey = "kick";
    } else if (cmd === "SPECIAL1") {
      attackData = this.frameKit.special1;
      clipKey = "special1";
    } else if (cmd === "SPECIAL2") {
      attackData = this.frameKit.special2;
      clipKey = "special2";
    } else if (cmd === "SPECIAL3") {
      attackData = this.frameKit.special3;
      clipKey = "special3";
    } else if (cmd === "FINISHER") {
      attackData = this.frameKit.finisher;
      clipKey = "finisher";
    }

    if (!attackData) return;

    // Check Ki Cost
    const store = useGameStore.getState();
    if (attackData.kiCost && store.energy < attackData.kiCost) {
      useGameStore.setState({ flash: "Need more KI" });
      return;
    }

    this.inputBuffer.consume(cmd);
    if (attackData.kiCost) {
      store.spendKi(attackData.kiCost);
      store.gainXp(15);
    }

    this.currentAttack = attackData;
    this.attackPhase = "startup";
    this.attackPhaseTimer = attackData.startupFrames / 60;
    this.hitHasConnected = false;
    this.fsm.changeState("ATTACK_STARTUP");

    if (attackData.iFrames) {
      this.iFrames = Math.max(this.iFrames, attackData.iFrames / 60);
    }

    useGameStore.setState({ currentMove: attackData.name, flash: "" });

    const clip = this.character.animationSet[clipKey as keyof typeof this.character.animationSet];
    this.sprite.anims.stop();
    this.sprite.setTexture(clip.textureKey, 0);
    this.sprite.play(clip.key);

    audioManager.swing(cmd === "LIGHT" ? 1.4 : cmd === "HEAVY" ? 0.9 : 1.1);
  }

  private updateAttackPhase(dt: number) {
    if (!this.currentAttack || !this.attackPhase) return;

    this.attackPhaseTimer -= dt;
    if (this.attackPhaseTimer <= 0) {
      if (this.attackPhase === "startup") {
        // Transition to ACTIVE phase -> Spawn Hitbox
        this.attackPhase = "active";
        this.attackPhaseTimer = this.currentAttack.activeFrames / 60;
        this.fsm.changeState("ATTACK_ACTIVE");
        this.spawnAttackHitbox();
      } else if (this.attackPhase === "active") {
        // Transition to RECOVERY phase
        this.attackPhase = "recovery";
        this.attackPhaseTimer = this.currentAttack.recoveryFrames / 60;
        this.fsm.changeState("ATTACK_RECOVERY");
      } else if (this.attackPhase === "recovery") {
        // Attack Complete -> Return to Neutral
        this.clearAttack();
        this.fsm.changeState(this.grounded ? "IDLE" : "JUMP_FALL");
      }
    }
  }

  private spawnAttackHitbox() {
    if (!this.currentAttack || !this.combat) return;
    const atk = this.currentAttack;
    const scene = this.sprite.scene;
    const isSpecial = atk.id.includes("chain") || atk.id.includes("wave") || atk.id.includes("dash") || atk.id.includes("clone") || atk.id.includes("stalker");
    const isFinisher = atk.id.includes("hood") || atk.id.includes("phantom");

    if (isFinisher) {
      audioManager.finisher();
      this.combat.spawnHit({
        x: this.x + this.facing * 75,
        y: this.y - 50,
        width: 170,
        height: 110,
        damage: atk.damage,
        chipDamage: atk.chipDamage,
        knockback: atk.knockbackX,
        knockbackY: atk.knockbackY,
        level: atk.level,
        hitReaction: atk.hitReaction,
        hitstopFrames: atk.hitstopFrames,
        faction: "player",
        durationMs: (atk.activeFrames / 60) * 1000,
      });
      playSlash(scene, this.x + this.facing * 30, this.y, this.facing);
      return;
    }

    if (atk.id.includes("wave")) {
      audioManager.special();
      const bolt = playWave(scene, this.x, this.y, this.facing);
      if (bolt) {
        this.combat.armProjectile(bolt, {
          damage: atk.damage,
          chipDamage: atk.chipDamage,
          knockback: atk.knockbackX,
          knockbackY: atk.knockbackY,
          level: atk.level,
          hitReaction: atk.hitReaction,
          hitstopFrames: atk.hitstopFrames,
          faction: "player",
          durationMs: 900,
        });
      }
      return;
    }

    if (atk.id.includes("clone")) {
      playClone(scene, this.sprite);
      audioManager.special();
    }

    // Standard Melee Hitbox
    playSlash(scene, this.x, this.y, this.facing);
    this.combat.spawnHit({
      x: this.x + this.facing * (isSpecial ? 68 : 58),
      y: this.y - 48,
      width: isSpecial ? 120 : 100,
      height: 90,
      damage: atk.damage,
      chipDamage: atk.chipDamage,
      knockback: atk.knockbackX,
      knockbackY: atk.knockbackY,
      level: atk.level,
      hitReaction: atk.hitReaction,
      hitstopFrames: atk.hitstopFrames,
      faction: "player",
      durationMs: (atk.activeFrames / 60) * 1000,
    });
  }

  private startParry() {
    this.fsm.changeState("PARRY_ACTIVE");
    this.parryWindow = this.frameKit.parry.activeFrames / 60;
    this.parryTimer =
      (this.frameKit.parry.activeFrames + this.frameKit.parry.recoveryFrames) /
      60;
    flashSprite(this.sprite, 0x00ffff, 90);
    audioManager.swing(2.0);
  }

  private startDash(forward: boolean) {
    this.fsm.changeState(forward ? "DASH_FWD" : "DASH_BACK");
    this.dashTimer = this.frameKit.dash.durationFrames / 60;
    this.iFrames = this.frameKit.dash.iFrames / 60;
    audioManager.dash();
    applySquashStretch(this.sprite, PLAYER_DISPLAY_SCALE, PLAYER_DISPLAY_SCALE, 1.35, 0.8, 120);
  }

  private clearAttack() {
    this.currentAttack = null;
    this.attackPhase = null;
    this.attackPhaseTimer = 0;
    useGameStore.setState({ currentMove: "" });
  }

  private playHurt() {
    const clip = this.character.animationSet.hurt;
    this.sprite.anims.stop();
    this.sprite.setTexture(clip.textureKey, 0);
    this.sprite.play(clip.key);
  }

  private knockOut() {
    this.recovering = true;
    this.clearAttack();
    this.fsm.changeState("KO");
    this.stunTimer = 1.2;
    useGameStore.setState({ flash: "K.O. - RECOVERING" });
    audioManager.defeat();

    this.sprite.scene.time.delayedCall(1200, () => {
      if (!this.sprite.active) return;
      this.sprite.setPosition(this.spawn.x, this.spawn.y);
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      useGameStore.getState().setHealth(this.character.health);
      this.iFrames = 1.5;
      this.stunTimer = 0;
      this.recovering = false;
      this.fsm.changeState("IDLE");
      useGameStore.setState({ flash: "" });
    });
  }

  private updateAnimation(onFloor: boolean) {
    if (this.recovering || this.fsm.currentState === "KO") return;
    if (this.fsm.currentState === "HITSTUN") return;
    if (this.fsm.isAttacking()) return;

    const set = this.character.animationSet;

    if (this.fsm.isBlocking() || this.fsm.isParrying()) {
      this.sprite.anims.stop();
      this.sprite.setTexture(set.idle.textureKey, 0);
      return;
    }

    if (!onFloor) {
      const frame = this.vy < -80 ? 1 : 3;
      this.sprite.anims.stop();
      if (this.sprite.texture.key !== set.jump.textureKey) {
        this.sprite.setTexture(set.jump.textureKey, frame);
      } else {
        this.sprite.setFrame(frame);
      }
      return;
    }

    const running =
      this.fsm.currentState === "WALK_FWD" ||
      this.fsm.currentState === "WALK_BACK" ||
      Math.abs(this.vx) > 28;
    const key = running ? set.run.key : set.idle.key;

    if (
      this.sprite.anims.currentAnim?.key !== key ||
      !this.sprite.anims.isPlaying
    ) {
      this.sprite.play(key, true);
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}
