import { ArrowUpRight } from "lucide-react";
import { JAV } from "../characters/CharacterData";
import { audioManager } from "../audio/AudioManager";
import { useGameStore } from "../systems/gameStore";

export function TitleOverlay() {
  return (
    <section className="fight-program dossier" aria-labelledby="fighter-name">
      <header className="program-line">South Florida Fighter <span>Fighter profile</span></header>
      <div className="fighter-photo">
        <img src={JAV.portrait} alt="JAV" />
        <h1 id="fighter-name">{JAV.name}</h1>
      </div>
      <div className="program-body">
        <h2>{JAV.title}</h2>
        <p>Fight through the Florida circuit to face the Syndicate Kingpin on Ocean Drive.</p>
        <dl className="fighter-stats">
          <div><dt>Health</dt><dd>{JAV.health}</dd></div>
          <div><dt>Ki capacity</dt><dd>{JAV.ki}</dd></div>
        </dl>
        <details><summary>Controls</summary>
          <p>Keyboard · A/D move, Space jumps. J/K/L jab, heavy attack and kick. F parries, S guards and E dashes. U/I/O use specials and P triggers the finisher.</p>
          <p>Touch · Use the directional pad to move and the action buttons to jump and attack.</p>
        </details>
        <button className="program-action" onClick={() => {
          audioManager.unlock();
          audioManager.roundAnnounce();
          useGameStore.getState().setScreen("city-select");
        }}>Enter Florida Circuit <ArrowUpRight /></button>
      </div>
    </section>
  );
}
