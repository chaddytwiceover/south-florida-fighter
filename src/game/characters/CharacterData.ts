export type AnimationClip = {
  key: string;
  textureKey: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  frameRate: number;
  repeat: number;
};

export type AnimName =
  | "idle"
  | "run"
  | "jump"
  | "hurt"
  | "light"
  | "heavy"
  | "kick"
  | "special1"
  | "special2"
  | "special3"
  | "finisher";

export type AnimationSet = Record<AnimName, AnimationClip>;

export type MoveEffect = "melee" | "projectile" | "dash" | "clone" | "finisher";

export type MoveData = {
  id: string;
  name: string;
  anim: AnimName;
  damage: number;
  kiCost: number;
  durationMs: number;
  effect: MoveEffect;
  description: string;
};

export type CharacterData = {
  id: string;
  name: string;
  title: string;
  tagline: string;
  portrait: string;
  accent: "royal" | "night";
  health: number;
  ki: number;
  movementSpeed: number;
  attackPower: number;
  attacks: [MoveData, MoveData, MoveData];
  specials: [MoveData, MoveData, MoveData];
  finisher: MoveData;
  animationSet: AnimationSet;
};

// 4 frames per sprite sheet row for smooth 60fps arcade step animation
const SHEET = { frameWidth: 256, frameHeight: 144, frames: 4 } as const;

function clip(
  id: string,
  action: AnimName,
  frameRate: number,
  repeat: number,
): AnimationClip {
  return {
    key: `${id}-${action}`,
    textureKey: `${id}-${action}`,
    url: `/game/sprites/characters/${id}/${action}.png`,
    ...SHEET,
    frameRate,
    repeat,
  };
}

function makeSet(id: string): AnimationSet {
  return {
    idle: clip(id, "idle", 8, -1),
    run: clip(id, "run", 10, -1),
    jump: clip(id, "jump", 8, 0),
    hurt: clip(id, "hurt", 10, 0),
    light: clip(id, "light", 14, 0),
    heavy: clip(id, "heavy", 12, 0),
    kick: clip(id, "kick", 12, 0),
    special1: clip(id, "special1", 12, 0),
    special2: clip(id, "special2", 12, 0),
    special3: clip(id, "special3", 12, 0),
    finisher: clip(id, "finisher", 12, 0),
  };
}

function move(
  partial: Omit<MoveData, "kiCost"> & { kiCost?: number },
): MoveData {
  return { kiCost: 0, ...partial };
}

export const JAV: CharacterData = {
  id: "jav",
  name: "JAV",
  title: "South Florida Champion",
  tagline: "Move smart. Hit clean. Rule the coast.",
  portrait: "/game/sprites/characters/jav/portrait.png",
  accent: "royal",
  health: 120,
  ki: 100,
  movementSpeed: 300,
  attackPower: 15,
  attacks: [
    move({
      id: "jav-light",
      name: "Street Jab",
      anim: "light",
      damage: 10,
      durationMs: 240,
      effect: "melee",
      description: "Quick straight punch that initiates combo strings.",
    }),
    move({
      id: "jav-heavy",
      name: "Royal Haymaker",
      anim: "heavy",
      damage: 22,
      durationMs: 380,
      effect: "melee",
      description: "Committed heavy punch with high knockback.",
    }),
    move({
      id: "jav-kick",
      name: "Crescent Sweep",
      anim: "kick",
      damage: 18,
      durationMs: 340,
      effect: "melee",
      description: "Low sweeping roundhouse that knocks down opponents.",
    }),
  ],
  specials: [
    move({
      id: "jav-chain",
      name: "Neon Chain Lash",
      anim: "special1",
      damage: 28,
      kiCost: 25,
      durationMs: 460,
      effect: "melee",
      description: "Unleash a purple energy chain whip that launches enemies.",
    }),
    move({
      id: "jav-wave",
      name: "Crown Plasma Wave",
      anim: "special2",
      damage: 32,
      kiCost: 30,
      durationMs: 480,
      effect: "projectile",
      description: "Fire a royal-purple ki plasma wave down the boardwalk.",
    }),
    move({
      id: "jav-step",
      name: "Shadow Blitz",
      anim: "special3",
      damage: 24,
      kiCost: 20,
      durationMs: 320,
      effect: "dash",
      description: "Invulnerable phantom dash through enemy lines.",
    }),
  ],
  finisher: move({
    id: "jav-hood",
    name: "Seismic Crown Slam",
    anim: "finisher",
    damage: 65,
    kiCost: 100,
    durationMs: 720,
    effect: "finisher",
    description: "Leap skyward and detonate a massive royal ground-rupture.",
  }),
  animationSet: makeSet("jav"),
};

export const CHARACTERS: CharacterData[] = [JAV];

export const PLAYABLE_CHARACTERS = CHARACTERS;

export function getCharacter(id?: string): CharacterData {
  return JAV;
}

export function allClips(character: CharacterData): AnimationClip[] {
  return Object.values(character.animationSet);
}

export function allRosterClips(): AnimationClip[] {
  return [JAV].flatMap(allClips);
}
