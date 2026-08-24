export type EnemyAnimName = "idle" | "run" | "attack" | "hurt";

export type EnemyClip = {
  key: string;
  textureKey: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  frameRate: number;
  repeat: number;
};

export type EnemyAnimationSet = Record<EnemyAnimName, EnemyClip>;

export type EnemyBehavior = "melee" | "fast";

export type EnemyData = {
  id: string;
  name: string;
  health: number;
  speed: number;
  damage: number;
  attackRange: number;
  aggroRange: number;
  attackDurationMs: number;
  attackCooldownMs: number;
  attackDelayMs: number;
  knockback: number;
  xp: number;
  kiReward: number;
  behaviorType: EnemyBehavior;
  animationSet: EnemyAnimationSet;
};

const SHEET = { frameWidth: 128, frameHeight: 128, frames: 4 } as const;

function clip(
  id: string,
  action: EnemyAnimName,
  frameRate: number,
  repeat: number,
): EnemyClip {
  return {
    key: `${id}-${action}`,
    textureKey: `${id}-${action}`,
    url: `/game/sprites/enemies/${id}/${action}.png`,
    ...SHEET,
    frameRate,
    repeat,
  };
}

function makeSet(id: string): EnemyAnimationSet {
  return {
    idle: clip(id, "idle", 6, -1),
    run: clip(id, "run", 10, -1),
    attack: clip(id, "attack", 12, 0),
    hurt: clip(id, "hurt", 10, 0),
  };
}

export const THUG: EnemyData = {
  id: "thug",
  name: "Boardwalk Bruiser",
  health: 32,
  speed: 92,
  damage: 8,
  attackRange: 72,
  aggroRange: 360,
  attackDurationMs: 520,
  attackCooldownMs: 1100,
  attackDelayMs: 180,
  knockback: 300,
  xp: 8,
  kiReward: 10,
  behaviorType: "melee",
  animationSet: makeSet("thug"),
};

export const RAT: EnemyData = {
  id: "rat",
  name: "Skate Rat",
  health: 18,
  speed: 170,
  damage: 6,
  attackRange: 80,
  aggroRange: 440,
  attackDurationMs: 400,
  attackCooldownMs: 820,
  attackDelayMs: 120,
  knockback: 240,
  xp: 6,
  kiReward: 8,
  behaviorType: "fast",
  animationSet: makeSet("rat"),
};

export const ENEMIES: EnemyData[] = [THUG, RAT];

export function getEnemy(id: string): EnemyData {
  return ENEMIES.find((e) => e.id === id) ?? THUG;
}

export function allEnemyClips(): EnemyClip[] {
  return ENEMIES.flatMap((enemy) => Object.values(enemy.animationSet));
}
