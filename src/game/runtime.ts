import type { Game } from "phaser";

let current: Game | null = null;
let restartTimer: number | null = null;

export function registerGame(game: Game) {
  current = game;
}

export function unregisterGame(game: Game) {
  if (current === game) current = null;
}

export function restartPlayScene() {
  if (typeof window === "undefined") return;
  if (restartTimer !== null) window.clearTimeout(restartTimer);
  restartTimer = window.setTimeout(() => {
    restartTimer = null;
    const scene = current?.scene.getScene("play");
    if (scene) scene.scene.restart();
  }, 50);
}
