import { create } from "zustand";
import { getCharacter, JAV } from "../characters/CharacterData";

export type GameScreen = "title" | "select" | "play";

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
  aliveEnemies: number;
  location: string;
  fps: number;
  debug: boolean;
  currentMove: string;
  specialIndex: number;
  flash: string;
  setPlaying: (playing: boolean) => void;
  setScreen: (screen: GameScreen) => void;
  setFps: (fps: number) => void;
  setHealth: (health: number) => void;
  setAliveEnemies: (n: number) => void;
  applyCharacter: (id: string) => void;
  rechargeKi: (amount: number) => void;
  spendKi: (amount: number) => void;
  gainKi: (amount: number) => void;
  gainXp: (amount: number) => void;
  addKo: () => void;
  addComboHit: () => void;
  resetCombo: () => void;
  setFlash: (flash: string) => void;
};

function persistCharacter(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("sfs.characterId", id);
}

function readSavedCharacter() {
  if (typeof window === "undefined") return JAV.id;
  return window.localStorage.getItem("sfs.characterId") ?? JAV.id;
}

const initial = getCharacter(readSavedCharacter());

export const useGameStore = create<GameStore>((set, get) => ({
  screen: "title",
  playing: false,
  characterId: initial.id,
  characterName: initial.name,
  portrait: initial.portrait,
  health: initial.health,
  maxHealth: initial.health,
  energy: 55,
  maxEnergy: initial.ki,
  xp: 0,
  coins: 0,
  kos: 0,
  comboHits: 0,
  aliveEnemies: 0,
  location: "Fort Lauderdale Beach",
  fps: 0,
  debug: false,
  currentMove: "",
  specialIndex: 0,
  flash: "",
  setPlaying: (playing) => set({ playing }),
  setScreen: (screen) => set({ screen, playing: screen === "play" }),
  setFps: (fps) => set({ fps }),
  setHealth: (health) => set({ health }),
  setAliveEnemies: (aliveEnemies) => set({ aliveEnemies }),
  setFlash: (flash) => set({ flash }),
  applyCharacter: (id) => {
    const character = getCharacter(id);
    persistCharacter(character.id);
    set({
      characterId: character.id,
      characterName: character.name,
      portrait: character.portrait,
      health: character.health,
      maxHealth: character.health,
      maxEnergy: character.ki,
      energy: 55,
      xp: 0,
      kos: 0,
      comboHits: 0,
      aliveEnemies: 0,
      currentMove: "",
      specialIndex: 0,
      flash: "",
    });
  },
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
  addKo: () => set({ kos: get().kos + 1, comboHits: get().comboHits }),
  addComboHit: () => set({ comboHits: get().comboHits + 1 }),
  resetCombo: () => set({ comboHits: 0 }),
}));
