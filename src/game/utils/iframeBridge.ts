/**
 * Iframe Embedding & Host Website Communication Bridge
 * Enables seamless two-way postMessage communication when hosted on Vercel
 * and embedded in parent sites / CMS / portals.
 */

import { audioManager } from "../audio/AudioManager";
import { restartPlayScene } from "../runtime";
import { useGameStore } from "../systems/gameStore";

export type GameEventPayload =
  | { type: "SF_GAME_READY" }
  | {
      type: "SF_MATCH_END";
      data: {
        winner: string;
        kos: number;
        maxCombo: number;
        character: string;
      };
    }
  | {
      type: "SF_STATE_CHANGE";
      data: {
        screen: string;
        health: number;
        energy: number;
      };
    };

export function postToParent(payload: GameEventPayload) {
  if (typeof window === "undefined" || window.parent === window) return;
  try {
    window.parent.postMessage(payload, "*");
  } catch (err) {
    console.warn("Could not postMessage to parent window:", err);
  }
}

export function initIframeBridge() {
  if (typeof window === "undefined") return () => {};

  const handleMessage = (event: MessageEvent) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "SF_SET_VOLUME" && typeof data.volume === "number") {
      audioManager.setVolume(data.volume);
    } else if (data.type === "SF_TOGGLE_MUTE") {
      audioManager.toggleMute();
    } else if (data.type === "SF_RESTART") {
      restartPlayScene();
    }
  };

  window.addEventListener("message", handleMessage);

  // Notify parent window that the game runtime is loaded
  postToParent({ type: "SF_GAME_READY" });

  return () => {
    window.removeEventListener("message", handleMessage);
  };
}
