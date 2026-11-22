import { SOUTH_FLORIDA_LEVELS, getLevel } from "../levels/LevelRegistry";
import { useGameStore } from "../systems/gameStore";
import { restartPlayScene } from "../runtime";
import { audioManager } from "../audio/AudioManager";
import { ArrowUpRight, Play } from "lucide-react";

export function CitySelectMap() {
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const selectedLevel = getLevel(currentLevelId);

  const handleSelectCity = (levelId: string) => {
    audioManager.swing(1.2);
    useGameStore.getState().setCurrentLevel(levelId);
  };

  const handleDeploy = () => {
    audioManager.unlock();
    audioManager.roundAnnounce();
    useGameStore.getState().resetRunStats();
    useGameStore.getState().setScreen("play");
    window.setTimeout(() => restartPlayScene(), 80);
  };

  const handleDirectLaunch = (levelId: string) => {
    audioManager.unlock();
    audioManager.roundAnnounce();
    useGameStore.getState().setCurrentLevel(levelId);
    useGameStore.getState().setScreen("play");
    window.setTimeout(() => restartPlayScene(), 80);
  };

  return (
    <section className="fight-program arena-program" aria-labelledby="arena-heading">
      <header className="program-line">Florida circuit
        <button onClick={() => useGameStore.getState().setScreen("title")}>← Fighter profile</button>
      </header>
      <div className="program-body">
        <h1 id="arena-heading">Choose Your Arena</h1>
        <figure className="venue-photo">
          <img alt="" src={selectedLevel.parallax.far} />
          <figcaption>{selectedLevel.name}</figcaption>
        </figure>
        <p className="venue-count">{selectedLevel.city} · {selectedLevel.enemies.length} opponents{selectedLevel.boss ? " · Boss fight" : ""}</p>
        <div className="venue-list">{SOUTH_FLORIDA_LEVELS.map(level => (
          <div key={level.id} className={level.id === selectedLevel.id ? "venue selected" : "venue"}>
            <button aria-pressed={level.id === selectedLevel.id} onClick={() => handleSelectCity(level.id)}>
              <img alt="" src={level.parallax.far} /><span>{level.city}</span>
            </button>
            <button aria-label={`Play ${level.name}`} onClick={() => handleDirectLaunch(level.id)}><Play size={16} /></button>
          </div>
        ))}</div>
        <button className="program-action" onClick={handleDeploy}>Fight in {selectedLevel.city} <ArrowUpRight /></button>
      </div>
    </section>
  );
}
