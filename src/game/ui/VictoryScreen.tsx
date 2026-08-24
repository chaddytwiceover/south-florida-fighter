import { getLevel, SOUTH_FLORIDA_LEVELS } from "../levels/LevelRegistry";
import { useGameStore } from "../systems/gameStore";
import { restartPlayScene } from "../runtime";
import { audioManager } from "../audio/AudioManager";
import { ChevronRight, MapPin, RotateCcw, Sparkles, Trophy } from "lucide-react";

export function VictoryScreen() {
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const health = useGameStore((s) => s.health);
  const maxHealth = useGameStore((s) => s.maxHealth);
  const maxCombo = useGameStore((s) => s.maxCombo);
  const kos = useGameStore((s) => s.kos);

  const level = getLevel(currentLevelId);
  const hpPct = Math.round((health / Math.max(1, maxHealth)) * 100);

  // Grade calculation
  const getGrade = () => {
    if (hpPct >= 80 && maxCombo >= 8) return { grade: "S", label: "FLAWLESS CHAMPION", color: "text-amber-300" };
    if (hpPct >= 50 || maxCombo >= 5) return { grade: "A", label: "DOMINANT VICTORY", color: "text-emerald-300" };
    if (hpPct >= 20) return { grade: "B", label: "CLEAN VICTORY", color: "text-cyan-300" };
    return { grade: "C", label: "SURVIVED THE GAUNTLET", color: "text-sand" };
  };

  const gradeInfo = getGrade();

  // Find next city
  const allLevels = SOUTH_FLORIDA_LEVELS.map((l) => l.id);
  const currentIndex = allLevels.indexOf(currentLevelId);
  const nextLevelId = allLevels[currentIndex + 1] ?? null;
  const nextLevel = nextLevelId ? getLevel(nextLevelId) : null;
  const isFinalStage = !nextLevelId;

  const handleNextCity = () => {
    if (!nextLevelId) {
      useGameStore.getState().setScreen("city-select");
      return;
    }
    audioManager.unlock();
    audioManager.roundAnnounce();
    useGameStore.getState().setCurrentLevel(nextLevelId);
    useGameStore.getState().setScreen("play");
    window.setTimeout(() => restartPlayScene(), 80);
  };

  const handleReplay = () => {
    audioManager.unlock();
    audioManager.roundAnnounce();
    useGameStore.getState().resetRunStats();
    useGameStore.getState().setScreen("play");
    window.setTimeout(() => restartPlayScene(), 80);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/90 px-4 py-6 select-none backdrop-blur-lg">
      <div className="w-full max-w-md rounded-[2rem] border border-foam/20 bg-ink/95 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        {/* Banner */}
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="size-4 text-gold animate-spin" />
          <p className="font-sans text-[0.68rem] font-black uppercase tracking-[0.32em] text-sand">
            {level.city} · Stage Cleared
          </p>
          <Sparkles className="size-4 text-gold animate-spin" />
        </div>

        <h2 className="mt-1 font-display text-5xl tracking-wide text-foam drop-shadow">
          {isFinalStage ? "CIRCUIT CHAMPION!" : "VICTORY!"}
        </h2>

        {/* Grade Badge Box */}
        <div className="my-4 flex items-center justify-center gap-4 rounded-2xl border border-gold/30 bg-gradient-to-b from-amber-500/15 to-ink p-4 shadow-inner">
          <div className="flex size-18 items-center justify-center rounded-2xl border-2 border-gold bg-ink font-display text-6xl text-gold shadow-[0_0_20px_rgba(232,196,90,0.5)]">
            {gradeInfo.grade}
          </div>
          <div className="text-left">
            <span className="font-mono text-xs font-bold text-sand/80 uppercase">
              Performance Grade
            </span>
            <p className={`font-display text-2xl leading-tight drop-shadow ${gradeInfo.color}`}>
              {gradeInfo.label}
            </p>
          </div>
        </div>

        {/* Combat Stats Grid */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-foam/10 bg-ink-2/70 p-3 font-mono">
          <div>
            <span className="block text-[0.62rem] text-foam/60 uppercase">Max Combo</span>
            <span className="font-display text-2xl text-coral">{maxCombo} HITS</span>
          </div>
          <div>
            <span className="block text-[0.62rem] text-foam/60 uppercase">Remaining HP</span>
            <span className="font-display text-2xl text-cyan-300">{hpPct}%</span>
          </div>
          <div>
            <span className="block text-[0.62rem] text-foam/60 uppercase">K.O. Count</span>
            <span className="font-display text-2xl text-gold">{kos}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleNextCity}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-coral via-sand to-gold px-8 font-sans text-base font-black uppercase tracking-[0.16em] text-ink shadow-[0_0_25px_rgba(232,93,76,0.7)] transition-all hover:scale-[1.01] active:scale-[0.98]"
          >
            <span>
              {isFinalStage
                ? "View Circuit Map"
                : `Next: ${nextLevel?.city ?? "Next City"}`}
            </span>
            <ChevronRight className="size-5" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleReplay}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-foam/20 bg-ink-2/80 font-sans text-xs font-bold uppercase tracking-wider text-foam hover:bg-ink active:scale-95"
            >
              <RotateCcw className="size-4" />
              <span>Replay Stage</span>
            </button>

            <button
              type="button"
              onClick={() => useGameStore.getState().setScreen("city-select")}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-foam/20 bg-ink-2/80 font-sans text-xs font-bold uppercase tracking-wider text-sand hover:bg-ink active:scale-95"
            >
              <MapPin className="size-4" />
              <span>Circuit Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
