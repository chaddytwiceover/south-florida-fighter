import { useEffect, useRef, useState } from "react";
import { inputManager } from "../input/InputManager";
import { useGameStore } from "../systems/gameStore";
import { CharacterSelect } from "./CharacterSelect";
import { Hud } from "./Hud";
import { RotateHint } from "./RotateHint";
import { TitleOverlay } from "./TitleOverlay";
import { TouchControls } from "./TouchControls";

export function GameApp() {
  const hostRef = useRef<HTMLDivElement>(null);
  const screen = useGameStore((s) => s.screen);
  const [touchReady, setTouchReady] = useState(false);

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
    <div className="game-shell">
      <div className="game-stage">
        <div ref={hostRef} id="sf-game" className="game-canvas" />
        {screen === "play" ? <Hud /> : null}
        {screen === "play" && touchReady ? <TouchControls /> : null}
        {screen === "title" ? <TitleOverlay /> : null}
        {screen === "select" ? <CharacterSelect /> : null}
        <RotateHint />
      </div>
    </div>
  );
}
