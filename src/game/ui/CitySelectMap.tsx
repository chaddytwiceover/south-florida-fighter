import { SOUTH_FLORIDA_LEVELS, getLevel } from "../levels/LevelRegistry";
import { useGameStore } from "../systems/gameStore";
import { restartPlayScene } from "../runtime";
import { audioManager } from "../audio/AudioManager";
import { cn } from "@/lib/utils";
import { ChevronRight, MapPin, Play, Sparkles, Trophy, Zap } from "lucide-react";

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
    <div className="absolute inset-0 z-30 flex items-stretch justify-center bg-ink/90 px-3 py-4 select-none backdrop-blur-md">
      <div className="flex h-full w-full max-w-md flex-col justify-between gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-coral animate-ping" />
              <p className="font-sans text-[0.62rem] font-bold uppercase tracking-[0.26em] text-sand">
                South Florida Circuit · 5 Cities
              </p>
            </div>
            <h2 className="font-display text-4xl leading-none text-foam">Choose Your Arena</h2>
          </div>
          <button
            type="button"
            onClick={() => useGameStore.getState().setScreen("title")}
            className="rounded-full border border-foam/20 bg-ink/80 px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-foam/80 hover:bg-ink active:scale-95"
          >
            Title
          </button>
        </div>

        {/* City List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {SOUTH_FLORIDA_LEVELS.map((lvl, index) => {
            const isSelected = lvl.id === selectedLevel.id;

            return (
              <div
                key={lvl.id}
                onClick={() => handleSelectCity(lvl.id)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "border-gold bg-ink/95 shadow-[0_0_20px_rgba(232,196,90,0.3)] ring-2 ring-gold"
                    : "border-foam/15 bg-ink/75 hover:border-foam/40 hover:bg-ink/85 active:scale-[0.99]",
                )}
              >
                {/* City Thumbnail */}
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-foam/20 bg-ocean">
                  <img
                    src={lvl.parallax.far}
                    alt=""
                    className="size-full object-cover"
                    draggable={false}
                  />
                  {isSelected ? (
                    <div className="absolute top-1 right-1 rounded-full bg-gold p-0.5 shadow">
                      <Sparkles className="size-3 text-ink" />
                    </div>
                  ) : null}
                </div>

                {/* City Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[0.6rem] font-black text-coral">
                      STAGE {index + 1}
                    </span>
                    <span className="font-sans text-[0.62rem] font-bold text-sand/80 uppercase">
                      · {lvl.city}
                    </span>
                  </div>
                  <p className="font-display text-2xl leading-none text-foam truncate">
                    {lvl.name}
                  </p>
                  <p className="mt-0.5 font-sans text-[0.65rem] text-muted line-clamp-1">
                    {lvl.tagline}
                  </p>
                </div>

                {/* Quick Launch Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectLaunch(lvl.id);
                  }}
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold hover:bg-gold hover:text-ink active:scale-95 transition-colors border border-gold/30"
                  aria-label={`Play ${lvl.name}`}
                >
                  <Play className="size-4 fill-current" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected City Briefing Box */}
        <div className="rounded-2xl border border-foam/20 bg-ink-2/85 p-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[0.7rem] font-black uppercase tracking-wider text-sand">
              {selectedLevel.city} · Fight Briefing
            </span>
            <span className="font-mono text-[0.62rem] text-foam/60">
              {selectedLevel.boss ? "★ CLIMAX BOSS ARENA" : "STANDARD ARENA"}
            </span>
          </div>
          <p className="mt-1 font-sans text-xs text-foam/85 leading-relaxed">
            {selectedLevel.tagline}
          </p>
          <div className="mt-2 flex items-center gap-3 border-t border-foam/10 pt-1.5 font-mono text-[0.62rem] text-foam/70">
            <span>Enemies: {selectedLevel.enemies.length} Fighters</span>
            <span>·</span>
            <span className="text-gold">Reward: +100 XP</span>
          </div>
        </div>

        {/* Deploy Button */}
        <button
          type="button"
          onClick={handleDeploy}
          className="flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-coral via-sand to-gold px-8 font-sans text-base font-black uppercase tracking-[0.18em] text-ink shadow-[0_0_25px_rgba(232,93,76,0.6)] transition-all hover:scale-[1.01] active:scale-[0.98]"
        >
          <Play className="size-5 fill-ink" />
          <span>Fight in {selectedLevel.city}</span>
          <Sparkles className="size-4.5 text-ink" />
        </button>
      </div>
    </div>
  );
}
