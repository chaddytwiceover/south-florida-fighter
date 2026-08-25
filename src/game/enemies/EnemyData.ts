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

export type EnemyBehavior = "melee" | "fast" | "boss";

export type EnemyData = {
  id: string;
  name: string;
  title: string;
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
  hasSuperArmor?: boolean;
  animationSet: EnemyAnimationSet;
};

type SheetConfig = {
  frameWidth: number;
  frameHeight: number;
  frames: number;
};

const STANDARD_SHEET: SheetConfig = { frameWidth: 160, frameHeight: 180, frames: 4 };
const BOSS_SHEET: SheetConfig = { frameWidth: 180, frameHeight: 200, frames: 4 };

function clip(
  id: string,
  action: EnemyAnimName,
  frameRate: number,
  repeat: number,
  sheet: SheetConfig = STANDARD_SHEET,
): EnemyClip {
  return {
    key: `${id}-${action}`,
    textureKey: `${id}-${action}`,
    url: `/game/sprites/enemies/${id}/${action}.png`,
    ...sheet,
    frameRate,
    repeat,
  };
}

function makeSet(id: string, sheet: SheetConfig = STANDARD_SHEET): EnemyAnimationSet {
  return {
    idle: clip(id, "idle", 6, -1, sheet),
    run: clip(id, "run", 8, -1, sheet),
    attack: clip(id, "attack", 10, 0, sheet),
    hurt: clip(id, "hurt", 10, 0, sheet),
  };
}

export const BRUISER: EnemyData = {
  id: "bruiser",
  name: "Boardwalk Bruiser",
  title: "Heavy Street Enforcer",
  health: 45,
  speed: 88,
  damage: 12,
  attackRange: 76,
  aggroRange: 380,
  attackDurationMs: 480,
  attackCooldownMs: 1200,
  attackDelayMs: 160,
  knockback: 320,
  xp: 12,
  kiReward: 14,
  behaviorType: "melee",
  hasSuperArmor: true,
  animationSet: makeSet("bruiser"),
};

export const BLADE: EnemyData = {
  id: "blade",
  name: "Ybor Blade",
  title: "Agile Knife Duelist",
  health: 28,
  speed: 180,
  damage: 8,
  attackRange: 82,
  aggroRange: 460,
  attackDurationMs: 360,
  attackCooldownMs: 800,
  attackDelayMs: 100,
  knockback: 220,
  xp: 10,
  kiReward: 12,
  behaviorType: "fast",
  animationSet: makeSet("blade"),
};

export const BOSS: EnemyData = {
  id: "boss",
  name: "Syndicate Kingpin",
  title: "Vice Underworld Boss",
  health: 160,
  speed: 95,
  damage: 22,
  attackRange: 95,
  aggroRange: 550,
  attackDurationMs: 640,
  attackCooldownMs: 1000,
  attackDelayMs: 200,
  knockback: 480,
  xp: 50,
  kiReward: 40,
  behaviorType: "boss",
  hasSuperArmor: true,
  animationSet: makeSet("boss", BOSS_SHEET),
};

export const ENEMIES: EnemyData[] = [BRUISER, BLADE, BOSS];

export function getEnemy(id: string): EnemyData {
  return ENEMIES.find((e) => e.id === id) ?? BRUISER;
}

export function allEnemyClips(): EnemyClip[] {
  return ENEMIES.flatMap((enemy) => Object.values(enemy.animationSet));
}
