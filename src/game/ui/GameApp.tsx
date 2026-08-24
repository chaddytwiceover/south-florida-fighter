import { useEffect, useRef, useState } from "react";
import { inputManager } from "../input/InputManager";
import { useGameStore } from "../systems/gameStore";
import { CharacterSelect } from "./CharacterSelect";
import { Hud } from "./Hud";
import { Preloader } from "./Preloader";
import { RotateHint } from "./RotateHint";
import { TitleOverlay } from "./TitleOverlay";
import { TouchControls } from "./TouchControls";
import { initIframeBridge, postToParent } from "../utils/iframeBridge";

export function GameApp() {
  const hostRef = useRef<HTMLDivElement>(null);
  const screen = useGameStore((s) => s.screen);
  const health = useGameStore((s) => s.health);
  const energy = useGameStore((s) => s.energy);

  const [isLoading, setIsLoading] = useState(true);
  const [touchReady, setTouchReady] = useState(false);

  // Initialize iframe bridge
  useEffect(() => {
    const cleanup = initIframeBridge();
    return cleanup;
  }, []);

  // Post state updates to parent iframe
  useEffect(() => {
    postToParent({
      type: "SF_STATE_CHANGE",
      data: {
        screen,
        health,
        energy,
      },
    });
  }, [screen, health, energy]);

  // Phaser Game lifecycle
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let game: { destroy: (remove: boolean) => void } | null = null;
    let cancelled = false;

    void import("../createGame").then(({ createGame }) => {
      if (cancelled || !host) return;
      game = createGame(host);
    });

    return () => {
      cancelled = true;
      game?.destroy(true);
      host.replaceChildren();
    };
  }, []);

  // Input & screen routing
  useEffect(() => {
    if (screen !== "play") {
      inputManager.enabled = false;
      setTouchReady(false);
      return;
    }
    inputManager.bind();
    inputManager.enablePlay();
    setTouchReady(false);
    const timer = window.setTimeout(() => setTouchReady(true), 450);
    return () => window.clearTimeout(timer);
  }, [screen]);

  return (
    <div
      className="game-shell"
      tabIndex={0}
      onClick={() => hostRef.current?.focus()}
    >
      <div className="game-stage">
        <div ref={hostRef} id="sf-game" className="game-canvas" />

        {isLoading ? (
          <Preloader onReady={() => setIsLoading(false)} />
        ) : (
          <>
            {screen === "play" ? <Hud /> : null}
            {screen === "play" && touchReady ? <TouchControls /> : null}
            {screen === "title" ? <TitleOverlay /> : null}
            {screen === "select" ? <CharacterSelect /> : null}
          </>
        )}

        <RotateHint />
      </div>
    </div>
  );
}
