/**
 * Frame Data & Combat Timing Constants
 * Based on 60 FPS standard fighting game architecture.
 */

export type AttackLevel = "high" | "mid" | "low" | "overhead" | "unblockable";
export type HitReaction = "light" | "heavy" | "knockdown" | "launch" | "wallbounce";

export type AttackFrameData = {
  id: string;
  name: string;
  level: AttackLevel;
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  damage: number;
  chipDamage: number;
  blockStunFrames: number;
  hitStunFrames: number;
  hitReaction: HitReaction;
  knockbackX: number;
  knockbackY: number;
  hitstopFrames: number;
  cancelableTo: ("special" | "finisher" | "dash")[];
  kiCost?: number;
  kiGainOnHit?: number;
  iFrames?: number; // Invincibility frames from startup
};

export type CharacterFrameKit = {
  light: AttackFrameData;
  heavy: AttackFrameData;
  kick: AttackFrameData;
  special1: AttackFrameData;
  special2: AttackFrameData;
  special3: AttackFrameData;
  finisher: AttackFrameData;
  parry: {
    startupFrames: number;
    activeFrames: number;
    recoveryFrames: number;
    advantageFrames: number;
  };
  dash: {
    durationFrames: number;
    iFrames: number;
    speed: number;
  };
};

export const JAV_FRAME_KIT: CharacterFrameKit = {
  light: {
    id: "jav-light",
    name: "Street Jab",
    level: "high",
    startupFrames: 4,
    activeFrames: 3,
    recoveryFrames: 8,
    damage: 10,
    chipDamage: 0,
    blockStunFrames: 6,
    hitStunFrames: 14,
    hitReaction: "light",
    knockbackX: 120,
    knockbackY: -40,
    hitstopFrames: 5,
    cancelableTo: ["special", "finisher"],
    kiGainOnHit: 12,
  },
  heavy: {
    id: "jav-heavy",
    name: "Royal Haymaker",
    level: "mid",
    startupFrames: 8,
    activeFrames: 4,
    recoveryFrames: 14,
    damage: 22,
    chipDamage: 4,
    blockStunFrames: 10,
    hitStunFrames: 22,
    hitReaction: "heavy",
    knockbackX: 280,
    knockbackY: -80,
    hitstopFrames: 9,
    cancelableTo: ["special", "finisher"],
    kiGainOnHit: 18,
  },
  kick: {
    id: "jav-kick",
    name: "Boardwalk Crescent",
    level: "low",
    startupFrames: 7,
    activeFrames: 4,
    recoveryFrames: 12,
    damage: 18,
    chipDamage: 3,
    blockStunFrames: 8,
    hitStunFrames: 18,
    hitReaction: "knockdown",
    knockbackX: 320,
    knockbackY: -180,
    hitstopFrames: 8,
    cancelableTo: ["special", "finisher"],
    kiGainOnHit: 15,
  },
  special1: {
    id: "jav-chain",
    name: "Neon Chain Strike",
    level: "mid",
    startupFrames: 9,
    activeFrames: 5,
    recoveryFrames: 16,
    damage: 28,
    chipDamage: 6,
    blockStunFrames: 12,
    hitStunFrames: 26,
    hitReaction: "launch",
    knockbackX: 220,
    knockbackY: -380,
    hitstopFrames: 10,
    cancelableTo: ["finisher"],
    kiCost: 25,
    kiGainOnHit: 8,
  },
  special2: {
    id: "jav-wave",
    name: "Crown Plasma Wave",
    level: "high",
    startupFrames: 12,
    activeFrames: 8,
    recoveryFrames: 18,
    damage: 32,
    chipDamage: 8,
    blockStunFrames: 14,
    hitStunFrames: 24,
    hitReaction: "heavy",
    knockbackX: 360,
    knockbackY: -60,
    hitstopFrames: 10,
    cancelableTo: ["finisher"],
    kiCost: 30,
    kiGainOnHit: 6,
  },
  special3: {
    id: "jav-step",
    name: "Shadow Blitz",
    level: "overhead",
    startupFrames: 6,
    activeFrames: 6,
    recoveryFrames: 10,
    damage: 24,
    chipDamage: 5,
    blockStunFrames: 12,
    hitStunFrames: 22,
    hitReaction: "wallbounce",
    knockbackX: 420,
    knockbackY: -120,
    hitstopFrames: 9,
    cancelableTo: ["finisher"],
    kiCost: 20,
    iFrames: 6,
    kiGainOnHit: 8,
  },
  finisher: {
    id: "jav-hood",
    name: "South Florida Legend",
    level: "unblockable",
    startupFrames: 14,
    activeFrames: 10,
    recoveryFrames: 24,
    damage: 65,
    chipDamage: 30,
    blockStunFrames: 20,
    hitStunFrames: 45,
    hitReaction: "launch",
    knockbackX: 580,
    knockbackY: -480,
    hitstopFrames: 18,
    cancelableTo: [],
    kiCost: 100,
    iFrames: 14,
  },
  parry: {
    startupFrames: 2,
    activeFrames: 6,
    recoveryFrames: 14,
    advantageFrames: 16,
  },
  dash: {
    durationFrames: 14,
    iFrames: 8,
    speed: 720,
  },
};

export const KENO_FRAME_KIT: CharacterFrameKit = {
  light: {
    id: "keno-light",
    name: "Phantom Edge",
    level: "high",
    startupFrames: 3,
    activeFrames: 3,
    recoveryFrames: 6,
    damage: 9,
    chipDamage: 0,
    blockStunFrames: 5,
    hitStunFrames: 12,
    hitReaction: "light",
    knockbackX: 100,
    knockbackY: -30,
    hitstopFrames: 4,
    cancelableTo: ["special", "finisher"],
    kiGainOnHit: 14,
  },
  heavy: {
    id: "keno-heavy",
    name: "Obsidian Slice",
    level: "mid",
    startupFrames: 7,
    activeFrames: 4,
    recoveryFrames: 12,
    damage: 24,
    chipDamage: 5,
    blockStunFrames: 9,
    hitStunFrames: 20,
    hitReaction: "heavy",
    knockbackX: 260,
    knockbackY: -70,
    hitstopFrames: 8,
    cancelableTo: ["special", "finisher"],
    kiGainOnHit: 18,
  },
  kick: {
    id: "keno-kick",
    name: "Cyclone Sweep",
    level: "low",
    startupFrames: 6,
    activeFrames: 4,
    recoveryFrames: 10,
    damage: 16,
    chipDamage: 3,
    blockStunFrames: 7,
    hitStunFrames: 16,
    hitReaction: "knockdown",
    knockbackX: 300,
    knockbackY: -160,
    hitstopFrames: 7,
    cancelableTo: ["special", "finisher"],
    kiGainOnHit: 16,
  },
  special1: {
    id: "keno-dash",
    name: "Ghost Flash",
    level: "mid",
    startupFrames: 5,
    activeFrames: 6,
    recoveryFrames: 12,
    damage: 26,
    chipDamage: 5,
    blockStunFrames: 11,
    hitStunFrames: 24,
    hitReaction: "launch",
    knockbackX: 240,
    knockbackY: -360,
    hitstopFrames: 9,
    cancelableTo: ["finisher"],
    kiCost: 20,
    iFrames: 5,
    kiGainOnHit: 8,
  },
  special2: {
    id: "keno-clone",
    name: "Shadow Mirage",
    level: "overhead",
    startupFrames: 8,
    activeFrames: 8,
    recoveryFrames: 14,
    damage: 30,
    chipDamage: 6,
    blockStunFrames: 12,
    hitStunFrames: 22,
    hitReaction: "wallbounce",
    knockbackX: 380,
    knockbackY: -100,
    hitstopFrames: 9,
    cancelableTo: ["finisher"],
    kiCost: 30,
    kiGainOnHit: 10,
  },
  special3: {
    id: "keno-stalker",
    name: "Abyssal Descent",
    level: "overhead",
    startupFrames: 10,
    activeFrames: 6,
    recoveryFrames: 16,
    damage: 34,
    chipDamage: 8,
    blockStunFrames: 14,
    hitStunFrames: 28,
    hitReaction: "launch",
    knockbackX: 300,
    knockbackY: -420,
    hitstopFrames: 11,
    cancelableTo: ["finisher"],
    kiCost: 30,
    kiGainOnHit: 8,
  },
  finisher: {
    id: "keno-phantom",
    name: "Thousand Shadow Lotus",
    level: "unblockable",
    startupFrames: 12,
    activeFrames: 12,
    recoveryFrames: 22,
    damage: 68,
    chipDamage: 30,
    blockStunFrames: 20,
    hitStunFrames: 50,
    hitReaction: "launch",
    knockbackX: 600,
    knockbackY: -500,
    hitstopFrames: 20,
    cancelableTo: [],
    kiCost: 100,
    iFrames: 14,
  },
  parry: {
    startupFrames: 2,
    activeFrames: 6,
    recoveryFrames: 12,
    advantageFrames: 18,
  },
  dash: {
    durationFrames: 12,
    iFrames: 9,
    speed: 800,
  },
};

export function getFrameKit(characterId: string): CharacterFrameKit {
  return characterId === "keno" ? KENO_FRAME_KIT : JAV_FRAME_KIT;
}
