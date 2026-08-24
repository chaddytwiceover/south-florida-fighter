import { COMBAT } from "../config";
import { Enemy } from "../enemies/Enemy";
import { allEnemyClips, getEnemy } from "../enemies/EnemyData";
import { playImpact } from "../systems/CombatFx";
import { useGameStore } from "../systems/gameStore";
import type { Player } from "../systems/Player";
import { floatText, shakeCamera } from "./Juice";

export type Faction = "player" | "enemy";

export type HitSpec = {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  knockback: number;
  faction: Faction;
  durationMs: number;
  follow?: Phaser.Physics.Arcade.Sprite;
  followOffsetX?: number;
  followOffsetY?: number;
};

type HitData = HitSpec & { struck: Set<string> };

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

  constructor(private scene: Phaser.Scene, debug = false) {
    this.debug = debug;
    this.hitboxes = scene.physics.add.group();
    this.enemySprites = scene.physics.add.group();
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
    spec: Pick<HitSpec, "damage" | "knockback" | "faction" | "durationMs">,
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
        const ebody = enemy.sprite.body as Phaser.Physics.Arcade.Body | undefined;
        const bodyHit = Boolean(box && ebody && overlaps(box, ebody));
        const spriteHit = near(
          hit.x - hit.width / 2,
          hit.y - hit.height / 2,
          hit.width,
          hit.height,
          enemy.x - 28,
          enemy.y - 90,
          56,
          90,
        );
        if (!bodyHit && !spriteHit) continue;
        hit.struck.add(enemy.id);
        this.landOnEnemy(player, enemy, hit);
      }
    } else if (hit.faction === "enemy") {
      if (hit.struck.has("player")) return;
      const pbody = player.sprite.body as Phaser.Physics.Arcade.Body;
      if (overlaps(box, pbody)) {
        hit.struck.add("player");
        this.landOnPlayer(player, hit);
      }
    }
  }

  private landOnEnemy(player: Player, enemy: Enemy, hit: HitData) {
    const dir = player.facing;
    const connected = enemy.takeHit(hit.damage, dir * hit.knockback);
    if (!connected) return;
    playImpact(this.scene, enemy.x + dir * 18, enemy.y - 56);
    floatText(this.scene, enemy.x, enemy.y - 120, `${hit.damage}`, "#f3e2c2");
    shakeCamera(this.scene, hit.damage > 20 ? 0.012 : COMBAT.shake);
    this.hitstop(hit.damage > 20 ? 80 : COMBAT.hitstopMs);
    const store = useGameStore.getState();
    store.addComboHit();
    store.gainKi(6);
    store.gainXp(enemy.data.xp);
    if (enemy.dead) {
      store.addKo();
      store.gainKi(enemy.data.kiReward);
      floatText(this.scene, enemy.x, enemy.y - 150, "KO", "#e85d4c");
      if (this.aliveCount() === 0) {
        store.setFlash("Boardwalk clear");
      }
    }
  }

  private landOnPlayer(player: Player, hit: HitData) {
    const originX = hit.follow?.x ?? hit.x;
    const dir = player.x < originX ? -1 : 1;
    const connected = player.takeHit(hit.damage, dir * hit.knockback);
    if (!connected) return;
    playImpact(this.scene, player.x - dir * 16, player.y - 56);
    floatText(this.scene, player.x, player.y - 130, `${hit.damage}`, "#e85d4c");
    shakeCamera(this.scene, 0.01);
    this.hitstop(60);
    useGameStore.getState().resetCombo();
  }
}
