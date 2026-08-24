import { create } from "zustand";
import { getCharacter, JAV } from "../characters/CharacterData";
import { getLevel, SOUTH_FLORIDA_LEVELS } from "../levels/LevelRegistry";

export type GameScreen = "title" | "city-select" | "play" | "victory";

type GameStore = {
  screen: GameScreen;
  playing: boolean;
  characterId: string;
  characterName: string;
  portrait: string;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  xp: number;
  coins: number;
  kos: number;
  comboHits: number;
  maxCombo: number;
  aliveEnemies: number;
  location: string;
  currentLevelId: string;
  unlockedLevels: string[];
  fps: number;
  debug: boolean;
  currentMove: string;
  specialIndex: number;
  flash: string;
  setPlaying: (playing: boolean) => void;
  setScreen: (screen: GameScreen) => void;
  setCurrentLevel: (levelId: string) => void;
  markLevelComplete: (levelId: string) => void;
  setFps: (fps: number) => void;
  setHealth: (health: number) => void;
  setAliveEnemies: (n: number) => void;
  rechargeKi: (amount: number) => void;
  spendKi: (amount: number) => void;
  gainKi: (amount: number) => void;
  gainXp: (amount: number) => void;
  addKo: () => void;
  addComboHit: () => void;
  resetCombo: () => void;
  setFlash: (flash: string) => void;
  resetRunStats: () => void;
};

const ALL_LEVEL_IDS = ["fort-lauderdale", "tampa", "palm-beach", "miami", "miami-beach"];

function readUnlockedLevels(): string[] {
  if (typeof window === "undefined") return ALL_LEVEL_IDS;
  try {
    const saved = window.localStorage.getItem("sfs.unlockedLevels");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= ALL_LEVEL_IDS.length) return parsed;
    }
  } catch {}
  return ALL_LEVEL_IDS;
}

function saveUnlockedLevels(levels: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("sfs.unlockedLevels", JSON.stringify(levels));
  } catch {}
}

const initialChar = JAV;
const initialLevel = getLevel("fort-lauderdale");

export const useGameStore = create<GameStore>((set, get) => ({
  screen: "title",
  playing: false,
  characterId: initialChar.id,
  characterName: initialChar.name,
  portrait: initialChar.portrait,
  health: initialChar.health,
  maxHealth: initialChar.health,
  energy: 50,
  maxEnergy: initialChar.ki,
  xp: 0,
  coins: 0,
  kos: 0,
  comboHits: 0,
  maxCombo: 0,
  aliveEnemies: 0,
  currentLevelId: initialLevel.id,
  unlockedLevels: readUnlockedLevels(),
  location: `${initialLevel.city} · ${initialLevel.name}`,
  fps: 0,
  debug: false,
  currentMove: "",
  specialIndex: 0,
  flash: "",

  setPlaying: (playing) => set({ playing }),
  setScreen: (screen) => set({ screen, playing: screen === "play" }),

  setCurrentLevel: (levelId) => {
    const lvl = getLevel(levelId);
    set({
      currentLevelId: lvl.id,
      location: `${lvl.city} · ${lvl.name}`,
      health: initialChar.health,
      energy: 50,
      comboHits: 0,
      maxCombo: 0,
      kos: 0,
      currentMove: "",
      flash: "",
    });
  },

  markLevelComplete: (levelId) => {
    const current = get().unlockedLevels;
    const all = SOUTH_FLORIDA_LEVELS.map((l) => l.id);
    const currentIndex = all.indexOf(levelId);
    const nextLevelId = all[currentIndex + 1];

    if (nextLevelId && !current.includes(nextLevelId)) {
      const updated = [...current, nextLevelId];
      saveUnlockedLevels(updated);
      set({ unlockedLevels: updated });
    }
  },

  setFps: (fps) => set({ fps }),
  setHealth: (health) => set({ health }),
  setAliveEnemies: (aliveEnemies) => set({ aliveEnemies }),
  setFlash: (flash) => set({ flash }),

  rechargeKi: (amount) => {
    const { energy, maxEnergy, currentMove } = get();
    if (currentMove) return;
    set({ energy: Math.min(maxEnergy, energy + amount) });
  },

  spendKi: (amount) => {
    const { energy } = get();
    set({ energy: Math.max(0, energy - amount) });
  },

  gainKi: (amount) => {
    const { energy, maxEnergy } = get();
    set({ energy: Math.min(maxEnergy, energy + amount) });
  },

  gainXp: (amount) => {
    const { xp } = get();
    set({ xp: Math.min(100, xp + amount) });
  },

  addKo: () => set({ kos: get().kos + 1 }),

  addComboHit: () => {
    const newHits = get().comboHits + 1;
    const maxCombo = Math.max(get().maxCombo, newHits);
    set({ comboHits: newHits, maxCombo });
  },

  resetCombo: () => set({ comboHits: 0 }),

  resetRunStats: () =>
    set({
      health: initialChar.health,
      energy: 50,
      kos: 0,
      comboHits: 0,
      maxCombo: 0,
      currentMove: "",
      flash: "",
    }),
}));
