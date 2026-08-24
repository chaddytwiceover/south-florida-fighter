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
      if (scene.anims.exists(clip.key)) continue;
      scene.anims.create({
        key: clip.key,
        frames: scene.anims.generateFrameNumbers(clip.textureKey, {
          start: 0,
          end: clip.frames - 1,
        }),
        frameRate: clip.frameRate,
        repeat: clip.repeat,
      });
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
    const rect = this.scene.add.rectangle(
      spec.x,
      spec.y,
      spec.width,
      spec.height,
      0xe85d4c,
      this.debug ? 0.28 : 0,
    );
    rect.setOrigin(0.5, 0.5);
    rect.setDepth(23);
    this.scene.physics.add.existing(rect);
    const body = rect.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(spec.width, spec.height);
    body.updateFromGameObject();
    const data: HitData = { ...spec, struck: new Set() };
    rect.setData("hit", data);
    this.hitboxes.add(rect);
    this.resolveHitbox(rect, data);
    this.scene.time.delayedCall(spec.durationMs, () => {
      if (rect.active) rect.destroy();
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
      if (sprite.active) sprite.destroy();
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

    // Visual juice
    const hitX = (player.x + enemy.x) / 2;
    const hitY = enemy.y - 54;
    playImpact(this.scene, hitX, hitY);
    spawnHitSparks(this.scene, hitX, hitY, hit.damage > 25 ? 0xff4444 : 0xffe600, 10);

    // Dynamic floating text
    const isHeavy = hit.damage > 20;
    floatText(
      this.scene,
      enemy.x,
      enemy.y - 120,
      `${scaledDamage}`,
      isHeavy ? "#e8c45a" : "#f4f7f5",
      isHeavy ? "36px" : "28px",
    );

    // Audio & hitstop
    if (isHeavy) {
      audioManager.hitHeavy();
      cameraZoomPunch(this.scene, 1.05, 140);
      shakeCamera(this.scene, 0.012, 160);
      this.hitstop(hit.hitstopFrames ? hit.hitstopFrames * 16 : 90);
    } else {
      audioManager.hitLight();
      shakeCamera(this.scene, COMBAT.shake, 100);
      this.hitstop(hit.hitstopFrames ? hit.hitstopFrames * 16 : COMBAT.hitstopMs);
    }

    store.addComboHit();
    audioManager.comboChime(store.comboHits);
    store.gainKi(8);
    store.gainXp(enemy.data.xp);

    if (enemy.dead) {
      store.addKo();
      store.gainKi(enemy.data.kiReward);
      floatText(this.scene, enemy.x, enemy.y - 150, "K.O.", "#e85d4c", "44px");
      audioManager.koAnnounce();
      cameraZoomPunch(this.scene, 1.08, 300);
      this.hitstop(160);

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
      spawnHitSparks(this.scene, player.x, player.y - 50, 0x00ffff, 14);
      flashSprite(player.sprite, 0x00ffff, 140);
      floatText(this.scene, player.x, player.y - 130, "JUST PARRY!", "#00ffff", "36px");
      shakeCamera(this.scene, 0.008, 120);
      this.hitstop(120);
      useGameStore.getState().gainKi(25);
      return;
    }

    if (hitResult.type === "block") {
      // Blocked!
      audioManager.block();
      spawnHitSparks(this.scene, player.x, player.y - 50, 0x88ccff, 6);
      flashSprite(player.sprite, 0x4488ff, 80);
      floatText(this.scene, player.x, player.y - 130, "GUARD", "#8aa0aa", "26px");
      shakeCamera(this.scene, 0.004, 80);
      this.hitstop(40);
      return;
    }

    if (hitResult.type === "hit") {
      // Direct Hit!
      playImpact(this.scene, player.x - dir * 16, player.y - 56);
      spawnHitSparks(this.scene, player.x, player.y - 56, 0xe85d4c, 8);
      floatText(this.scene, player.x, player.y - 130, `${hit.damage}`, "#e85d4c", "32px");
      shakeCamera(this.scene, 0.012, 150);
      this.hitstop(70);
      useGameStore.getState().resetCombo();
    }
  }
}
