import * as PhaserNS from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./config";
import { registerGame, unregisterGame } from "./runtime";
import { PlayScene } from "./scenes/PlayScene";

const Phaser = (PhaserNS as { default?: typeof PhaserNS }).default ?? PhaserNS;

export function createGame(parent: HTMLElement): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#0b6e7a",
    antialias: true,
    roundPixels: true,
    pixelArt: false,
    banner: false,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
        fps: 60,
        fixedStep: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    input: {
      keyboard: true,
      activePointers: 3,
    },
    scene: [PlayScene],
    audio: { disableWebAudio: true },
    render: {
      powerPreference: "high-performance",
    },
  });
  registerGame(game);
  game.events.once("destroy", () => unregisterGame(game));
  return game;
}
