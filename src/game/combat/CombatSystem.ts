import { audioManager } from "../audio/AudioManager";
import { getCharacter } from "../characters/CharacterData";
import { COMBAT, GAME_WIDTH } from "../config";
import { allEnemyClips, getEnemy } from "../enemies/EnemyData";
import { Enemy } from "../enemies/Enemy";
import { Player } from "../systems/Player";
import { useGameStore } from "../systems/gameStore";
import { playImpact } from "../systems/CombatFx";
import {
  cameraZoomPunch,
  flashSprite,
  floatText,
  shakeCamera,
  spawnHitSparks,
} from "./Juice";
import {
  applyJuiceHit,
  hitstopDuration,
  type HitTier,
} from "./CombatJuiciness";
import {
  acquireHitbox,
  createOptimizedAnimation,
  releaseHitbox,
  releaseProjectile,
} from "../PerformanceOptimizations.js";

export type AttackLevel = "high" | "mid" | "low" | "overhead" | "unblockable";

export type HitSpec = {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  chipDamage?: number;
  knockback: number;
  knockbackY?: number;
  hitReaction?: string;
  faction: "player" | "enemy";
  level?: AttackLevel;
  durationMs: number;
  hitstopFrames?: number;
  follow?: any;
  followOffsetX?: number;
  followOffsetY?: number;
};

type HitData = HitSpec & {
  struck: Set<string>;
};

function near(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function overlaps(
  a: Phaser.Physics.Arcade.Body,
  b: Phaser.Physics.Arcade.Body,
) {
  return near(a.x, a.y, a.width, a.height, b.x, b.y, b.width, b.height);
}

export class CombatSystem {
  readonly enemies: Enemy[] = [];
  readonly enemySprites: Phaser.Physics.Arcade.Group;
  private readonly hitboxes: Phaser.Physics.Arcade.Group;
  private player: Player | null = null;
  private freeze = 0;
  private debug: boolean;
  private onVictoryCallback?: () => void;

  constructor(private scene: Phaser.Scene, debug = false) {
    this.debug = debug;
    this.hitboxes = scene.physics.add.group();
    this.enemySprites = scene.physics.add.group();
  }

  setOnVictory(callback: () => void) {
    this.onVictoryCallback = callback;
  }

  static preloadAnims(scene: Phaser.Scene) {
    for (const clip of allEnemyClips()) {
      createOptimizedAnimation(scene, clip);
    }
  }

  bindPlayer(player: Player) {
    this.player = player;
    player.bindCombat(this);
  }

  spawnEnemy(id: string, x: number, y: number) {
    const enemy = new Enemy(this.scene, x, y, getEnemy(id));
    this.enemies.push(enemy);
    this.enemySprites.add(enemy.sprite);
    return enemy;
  }

  spawnHit(spec: HitSpec) {
    const rect = acquireHitbox(this.scene, spec, this.debug);
    const data: HitData = { ...spec, struck: new Set() };
    rect.setData("hit", data);
    this.hitboxes.add(rect);
    this.resolveHitbox(rect, data);
    this.scene.time.delayedCall(spec.durationMs, () => {
      if (rect.active) releaseHitbox(rect);
    });
    return rect;
  }

  armProjectile(
    sprite: Phaser.Physics.Arcade.Sprite,
    spec: Pick<HitSpec, "damage" | "knockback" | "faction" | "durationMs"> &
      Partial<HitSpec>,
  ) {
    const data: HitData = {
      x: sprite.x,
      y: sprite.y,
      width: sprite.displayWidth,
      height: sprite.displayHeight,
      follow: sprite,
      followOffsetX: 0,
      followOffsetY: 0,
      struck: new Set(),
      ...spec,
    };
    sprite.setData("hit", data);
    this.hitboxes.add(sprite);
    this.scene.time.delayedCall(spec.durationMs, () => {
      if (sprite.active) releaseProjectile(sprite);
    });
  }

  isFrozen() {
    return this.freeze > 0;
  }

  hitstop(ms: number = COMBAT.hitstopMs) {
    this.freeze = Math.max(this.freeze, ms / 1000);
  }

  tickFreeze(dt: number) {
    this.freeze = Math.max(0, this.freeze - dt);
  }

  update(dt: number) {
    for (const obj of this.hitboxes.getChildren()) {
      const go = obj as Phaser.GameObjects.Rectangle & Phaser.Physics.Arcade.Sprite;
      if (!go.active) continue;
      const hit = go.getData("hit") as HitData | undefined;
      if (hit?.follow && hit.follow.active) {
        const facing = hit.follow.flipX ? -1 : 1;
        go.setPosition(
          hit.follow.x + (hit.followOffsetX ?? 0) * facing,
          hit.follow.y + (hit.followOffsetY ?? 0),
        );
        const body = go.body as Phaser.Physics.Arcade.Body | undefined;
        body?.updateFromGameObject();
      }
      if (hit) this.resolveHitbox(go, hit);
    }

    const player = this.player;
    if (!player) return;

    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;
      enemy.update(dt, player.x, player.y, this);
    }
  }

  aliveCount() {
    return this.enemies.filter((e) => !e.dead && e.sprite.active).length;
  }

  shutdown() {
    this.enemies.length = 0;
  }

  private resolveHitbox(go: Phaser.GameObjects.GameObject, hit: HitData) {
    const player = this.player;
    if (!player) return;
    const box = go.body as Phaser.Physics.Arcade.Body | undefined;
    if (!box) return;

    if (hit.faction === "player") {
      for (const enemy of this.enemies) {
        if (enemy.dead || !enemy.sprite.active) continue;
        if (hit.struck.has(enemy.id)) continue;
        const ebody = enemy.sprite.body as Phaser.Physics.Arcade.Body;
        if (overlaps(box, ebody)) {
          hit.struck.add(enemy.id);
          this.applyEnemyHit(enemy, hit);
        }
      }
    } else if (hit.faction === "enemy") {
      if (hit.struck.has(player.id)) return;
      const pbody = player.sprite.body as Phaser.Physics.Arcade.Body;
      if (overlaps(box, pbody)) {
        hit.struck.add(player.id);
        this.landOnPlayer(player, hit);
      }
    }
  }

  private applyEnemyHit(enemy: Enemy, hit: HitData) {
    const player = this.player;
    if (!player) return;
    const dir = player.x < enemy.x ? 1 : -1;
    const store = useGameStore.getState();

    // Dynamic combo scaling
    const comboCount = store.comboHits;
    const scaling = Math.max(0.4, 1.0 - comboCount * 0.05);
    const scaledDamage = Math.max(1, Math.round(hit.damage * scaling));

    const landed = enemy.takeHit(
      scaledDamage,
      dir * hit.knockback,
      hit.knockbackY ?? (hit.level === "overhead" || hit.level === "unblockable" ? -140 : -70),
    );
    if (!landed) return;

    // Determine Hit Tier
    const isSuper = hit.damage >= 45 || hit.level === "unblockable";
    const isHeavy = hit.damage > 20;
    const tier: HitTier = isSuper ? "super" : isHeavy ? "heavy" : "light";

    // Visual juice & impact sound
    const hitX = (player.x + enemy.x) / 2;
    const hitY = enemy.y - 54;
    playImpact(this.scene, hitX, hitY);

    // Dynamic floating text
    floatText(
      this.scene,
      enemy.x,
      enemy.y - 120,
      `${scaledDamage}`,
      isSuper ? "#d53f8c" : isHeavy ? "#e8c45a" : "#f4f7f5",
      isSuper ? "42px" : isHeavy ? "36px" : "28px",
    );

    // Audio dispatch
    if (isSuper) {
      audioManager.finisher();
    } else if (isHeavy) {
      audioManager.hitHeavy();
    } else {
      audioManager.hitLight();
    }

    // Comprehensive Juiciness Engine (Hitstop + Camera Zoom/Shake + Flash + Timescale Ramp)
    const overrideHitstop = hit.hitstopFrames ? hit.hitstopFrames / 60 : undefined;
    const freezeSec = overrideHitstop ?? hitstopDuration(tier);
    this.hitstop(freezeSec * 1000);

    applyJuiceHit(this.scene, {
      tier,
      hitX,
      hitY,
      freezeSec,
      sparkColor: isSuper ? 0xd53f8c : isHeavy ? 0xe85d4c : 0xffe600,
    });

    store.addComboHit();
    audioManager.comboChime(store.comboHits);
    store.gainKi(8);
    store.gainXp(enemy.data.xp);

    if (enemy.dead) {
      store.addKo();
      store.gainKi(enemy.data.kiReward);
      floatText(this.scene, enemy.x, enemy.y - 150, "K.O.", "#e85d4c", "44px");
      audioManager.koAnnounce();
      applyJuiceHit(this.scene, {
        tier: "super",
        hitX: enemy.x,
        hitY: enemy.y - 60,
        freezeSec: 0.22,
      });

      const remaining = this.aliveCount();
      store.setAliveEnemies(remaining);
      if (remaining === 0) {
        this.onVictoryCallback?.();
      }
    }
  }

  private landOnPlayer(player: Player, hit: HitData) {
    const originX = (hit.follow as any)?.x ?? hit.x;
    const dir = player.x < originX ? -1 : 1;

    // Check Player Parry & Guard State
    const hitResult = player.receiveIncomingAttack(
      hit.damage,
      hit.chipDamage ?? 3,
      dir * hit.knockback,
      hit.level ?? "mid",
    );

    if (hitResult.type === "parry") {
      // Parried!
      audioManager.parry();
      flashSprite(player.sprite, 0x00ffff, 140);
      floatText(this.scene, player.x, player.y - 130, "JUST PARRY!", "#00ffff", "36px");

      const freezeSec = hitstopDuration("parry");
      this.hitstop(freezeSec * 1000);
      applyJuiceHit(this.scene, {
        tier: "parry",
        hitX: player.x,
        hitY: player.y - 50,
        freezeSec,
        sparkColor: 0x00ffff,
      });

      useGameStore.getState().gainKi(25);
      return;
    }

    if (hitResult.type === "block") {
      // Blocked!
      audioManager.block();
      flashSprite(player.sprite, 0x4488ff, 80);
      floatText(this.scene, player.x, player.y - 130, "GUARD", "#8aa0aa", "26px");

      const freezeSec = hitstopDuration("block");
      this.hitstop(freezeSec * 1000);
      applyJuiceHit(this.scene, {
        tier: "block",
        hitX: player.x,
        hitY: player.y - 50,
        freezeSec,
        sparkColor: 0x88ccff,
      });
      return;
    }

    if (hitResult.type === "hit") {
      // Direct Hit!
      playImpact(this.scene, player.x - dir * 16, player.y - 56);
      floatText(this.scene, player.x, player.y - 130, `${hit.damage}`, "#e85d4c", "32px");

      const isHeavy = hit.damage > 20;
      const tier: HitTier = isHeavy ? "heavy" : "light";
      const freezeSec = hitstopDuration(tier);
      this.hitstop(freezeSec * 1000);

      applyJuiceHit(this.scene, {
        tier,
        hitX: player.x - dir * 16,
        hitY: player.y - 56,
        freezeSec,
      });

      useGameStore.getState().resetCombo();
    }
  }
}
