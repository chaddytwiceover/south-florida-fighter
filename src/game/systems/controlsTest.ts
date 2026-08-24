import type { Player } from "./Player";
import { inputManager } from "../input/InputManager";
import { useGameStore } from "./gameStore";

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  getX: () => number;
  getY: () => number;
  getFacing: () => number;
  getGrounded: () => boolean;
  getMoveX: () => number;
  getEnabled: () => boolean;
  getHealth: () => number;
  getKos: () => number;
  getEnemyCount: () => number;
  getDisplay?: () => { w: number; h: number; frameW: number; frameH: number };
  setKeys: (codes: string[]) => void;
  setSteer: (v: number) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
    __playGeneration?: number;
  }
}

export function attachControlsTest(player: Player, getEnemyCount: () => number) {
  if (typeof window === "undefined") return;

  window.__controlsTest = {
    getYaw: () => (player.facing < 0 ? Math.PI / 2 : 0),
    getSpeed: () => player.vx,
    getX: () => player.x,
    getY: () => player.y,
    getFacing: () => player.facing,
    getGrounded: () => player.grounded,
    getMoveX: () => inputManager.snapshot().moveX,
    getEnabled: () => inputManager.enabled,
    getHealth: () => useGameStore.getState().health,
    getKos: () => useGameStore.getState().kos,
    getEnemyCount,
    getDisplay: () => ({
      w: player.sprite.displayWidth,
      h: player.sprite.displayHeight,
      frameW: player.sprite.frame.width,
      frameH: player.sprite.frame.height,
    }),
    setKeys: (codes: string[]) => {
      inputManager.setInjectedKeys(codes);
    },
    setSteer: (v: number) => {
      if (v > 0.2) inputManager.setInjectedKeys(["KeyA"]);
      else if (v < -0.2) inputManager.setInjectedKeys(["KeyD"]);
      else inputManager.setInjectedKeys([]);
    },
  };
}

export function detachControlsTest() {
  if (typeof window === "undefined") return;
  delete window.__controlsTest;
}
