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

const SHEET = { frameWidth: 128, frameHeight: 128, frames: 4 } as const;

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
    idle: clip(id, "idle", 6, -1),
    run: clip(id, "run", 10, -1),
    jump: clip(id, "jump", 8, 0),
    hurt: clip(id, "hurt", 8, 0),
    light: clip(id, "light", 14, 0),
    heavy: clip(id, "heavy", 11, 0),
    kick: clip(id, "kick", 12, 0),
    special1: clip(id, "special1", 12, 0),
    special2: clip(id, "special2", 12, 0),
    special3: clip(id, "special3", 12, 0),
    finisher: clip(id, "finisher", 10, 0),
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
  title: "Street Crown",
  tagline: "Move smart. Hit clean.",
  portrait: "/game/sprites/characters/jav/portrait.png",
  accent: "royal",
  health: 110,
  ki: 100,
  movementSpeed: 275,
  attackPower: 12,
  attacks: [
    move({
      id: "jav-light",
      name: "Light Punch",
      anim: "light",
      damage: 8,
      durationMs: 280,
      effect: "melee",
      description: "Quick jab that starts the string.",
    }),
    move({
      id: "jav-heavy",
      name: "Heavy Punch",
      anim: "heavy",
      damage: 14,
      durationMs: 420,
      effect: "melee",
      description: "Committed haymaker, second hit of the combo.",
    }),
    move({
      id: "jav-kick",
      name: "Kick",
      anim: "kick",
      damage: 12,
      durationMs: 400,
      effect: "melee",
      description: "Roundhouse that closes the three-hit string.",
    }),
  ],
  specials: [
    move({
      id: "jav-chain",
      name: "Chain Slash",
      anim: "special1",
      damage: 16,
      kiCost: 25,
      durationMs: 480,
      effect: "melee",
      description: "Whip a short purple chain from the lead fist.",
    }),
    move({
      id: "jav-wave",
      name: "Energy Wave",
      anim: "special2",
      damage: 18,
      kiCost: 30,
      durationMs: 500,
      effect: "projectile",
      description: "Fire a royal-purple ki bolt down the boardwalk.",
    }),
    move({
      id: "jav-step",
      name: "Shadow Step",
      anim: "special3",
      damage: 10,
      kiCost: 20,
      durationMs: 340,
      effect: "dash",
      description: "Blink-dash through a lane of space.",
    }),
  ],
  finisher: move({
    id: "jav-hood",
    name: "Hood Legend",
    anim: "finisher",
    damage: 32,
    kiCost: 100,
    durationMs: 780,
    effect: "finisher",
    description: "Drop low and detonate a crown shockwave.",
  }),
  animationSet: makeSet("jav"),
};

export const KENO: CharacterData = {
  id: "keno",
  name: "KENO",
  title: "Alley Phantom",
  tagline: "Silent, hits true, leaves only whispers.",
  portrait: "/game/sprites/characters/keno/portrait.png",
  accent: "night",
  health: 90,
  ki: 100,
  movementSpeed: 325,
  attackPower: 14,
  attacks: [
    move({
      id: "keno-light",
      name: "Light Slash",
      anim: "light",
      damage: 8,
      durationMs: 260,
      effect: "melee",
      description: "Short katana cut that starts the string.",
    }),
    move({
      id: "keno-heavy",
      name: "Heavy Slash",
      anim: "heavy",
      damage: 15,
      durationMs: 440,
      effect: "melee",
      description: "Overhead commit, second hit of the combo.",
    }),
    move({
      id: "keno-kick",
      name: "Spin Cut",
      anim: "kick",
      damage: 13,
      durationMs: 400,
      effect: "melee",
      description: "Turning slash that closes the three-hit string.",
    }),
  ],
  specials: [
    move({
      id: "keno-dash",
      name: "Shadow Dash",
      anim: "special1",
      damage: 12,
      kiCost: 20,
      durationMs: 320,
      effect: "dash",
      description: "Slip forward in a blade-first blur.",
    }),
    move({
      id: "keno-clone",
      name: "Shadow Clone",
      anim: "special2",
      damage: 8,
      kiCost: 30,
      durationMs: 500,
      effect: "clone",
      description: "Leave a whispering afterimage in place.",
    }),
    move({
      id: "keno-stalker",
      name: "Night Stalker",
      anim: "special3",
      damage: 20,
      kiCost: 30,
      durationMs: 520,
      effect: "melee",
      description: "Leaping overhead pounce from the dark.",
    }),
  ],
  finisher: move({
    id: "keno-phantom",
    name: "Alley Phantom",
    anim: "finisher",
    damage: 32,
    kiCost: 100,
    durationMs: 780,
    effect: "finisher",
    description: "Shadow fire erupts as the finishing stance hits.",
  }),
  animationSet: makeSet("keno"),
};

export const CHARACTERS: CharacterData[] = [JAV, KENO];

export const PLAYABLE_CHARACTERS = CHARACTERS;

export function getCharacter(id: string): CharacterData {
  return CHARACTERS.find((c) => c.id === id) ?? JAV;
}

export function allClips(character: CharacterData): AnimationClip[] {
  return Object.values(character.animationSet);
}

export function allRosterClips(): AnimationClip[] {
  return CHARACTERS.flatMap(allClips);
}
