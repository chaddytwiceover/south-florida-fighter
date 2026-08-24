import { useEffect, useState } from "react";
import { getCharacter } from "../characters/CharacterData";
import { inputManager } from "../input/InputManager";
import { useGameStore } from "../systems/gameStore";
import { audioManager } from "../audio/AudioManager";
import { Volume2, VolumeX, Shield, Zap, Sparkles, MapPin } from "lucide-react";

function getComboRank(hits: number) {
  if (hits >= 15) return { label: "LEGENDARY!", color: "text-amber-300 bg-amber-500/20 border-amber-400" };
  if (hits >= 10) return { label: "SAVAGE!", color: "text-rose-400 bg-rose-500/20 border-rose-400" };
  if (hits >= 7) return { label: "SUPER!", color: "text-purple-300 bg-purple-500/20 border-purple-400" };
  if (hits >= 4) return { label: "GREAT!", color: "text-cyan-300 bg-cyan-500/20 border-cyan-400" };
  return { label: "GOOD", color: "text-emerald-300 bg-emerald-500/20 border-emerald-400" };
}

export function Hud() {
  const characterId = useGameStore((s) => s.characterId);
  const characterName = useGameStore((s) => s.characterName);
  const portrait = useGameStore((s) => s.portrait);
  const health = useGameStore((s) => s.health);
  const maxHealth = useGameStore((s) => s.maxHealth);
  const energy = useGameStore((s) => s.energy);
  const maxEnergy = useGameStore((s) => s.maxEnergy);
  const xp = useGameStore((s) => s.xp);
  const kos = useGameStore((s) => s.kos);
  const comboHits = useGameStore((s) => s.comboHits);
  const aliveEnemies = useGameStore((s) => s.aliveEnemies);
  const location = useGameStore((s) => s.location);
  const fps = useGameStore((s) => s.fps);
  const debug = useGameStore((s) => s.debug);
  const currentMove = useGameStore((s) => s.currentMove);
  const flash = useGameStore((s) => s.flash);

  const [ghostHp, setGhostHp] = useState(health);
  const [muted, setMuted] = useState(audioManager.muted);

  // Smooth ghost damage trail
  useEffect(() => {
    if (health < ghostHp) {
      const timer = setTimeout(() => {
        setGhostHp((prev) => Math.max(health, prev - (prev - health) * 0.25));
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setGhostHp(health);
    }
  }, [health, ghostHp]);

  const character = getCharacter(characterId);
  const hpPct = Math.max(0, Math.min(100, (health / Math.max(1, maxHealth)) * 100));
  const ghostHpPct = Math.max(0, Math.min(100, (ghostHp / Math.max(1, maxHealth)) * 100));
  const kiPct = Math.max(0, Math.min(100, (energy / Math.max(1, maxEnergy)) * 100));
  const finisherReady = energy >= 100;

  const toggleAudio = () => {
    const isMuted = audioManager.toggleMute();
    setMuted(isMuted);
  };

  return (
    <div
      data-testid="hud"
      className="pointer-events-none absolute inset-x-0 top-0 z-20 p-[max(0.45rem,env(safe-area-inset-top))] px-[max(0.7rem,env(safe-area-inset-left))]"
    >
      <div className="flex items-start justify-between gap-2">
        {/* Left Side: Modern Fighter Status Bar */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[1.2rem] border border-foam/20 bg-ink/85 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md">
          {/* Animated Portrait Box */}
          <div className="relative size-13 shrink-0 overflow-hidden rounded-[0.85rem] border-2 border-gold/60 bg-ocean shadow-md">
            <img
              src={portrait}
              alt=""
              className="size-full object-cover object-top"
              draggable={false}
            />
            {finisherReady ? (
              <div className="absolute inset-0 bg-gold/30 animate-pulse flex items-center justify-center">
                <Sparkles className="size-5 text-amber-200" />
              </div>
            ) : null}
          </div>

          {/* Health & Ki Meters */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl leading-none tracking-wide text-foam drop-shadow">
                {characterName}
              </span>
              <span className="font-mono text-[0.65rem] font-bold text-sand/80">
                HP {Math.round(health)}/{maxHealth}
              </span>
            </div>

            {/* Health Bar with Ghost Damage Trail */}
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-ink-2 ring-1 ring-foam/20">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-rose-800 transition-all duration-300 ease-out"
                style={{ width: `${ghostHpPct}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-coral to-rose-500 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(232,93,76,0.9)]"
                style={{ width: `${hpPct}%` }}
              />
            </div>

            {/* 3-Tier Segmented Ki / EX Gauge */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[0.58rem] font-extrabold uppercase tracking-wider">
                <span className={finisherReady ? "text-gold animate-pulse" : "text-foam/70"}>
                  {finisherReady ? "★ SEISMIC CROWN SLAM READY" : "KI GAUGE"}
                </span>
                <span className="font-mono text-foam/60">{Math.round(energy)}%</span>
              </div>
              <div className="relative flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-ink-2 p-0.5 ring-1 ring-foam/20">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    finisherReady
                      ? "bg-gradient-to-r from-amber-400 via-gold to-yellow-300 shadow-[0_0_12px_rgba(232,196,90,1)] animate-pulse"
                      : "bg-gradient-to-r from-ocean-2 to-cyan-400 shadow-[0_0_8px_rgba(20,145,155,0.8)]"
                  }`}
                  style={{ width: `${kiPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Combos, Location & Circuit Buttons */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleAudio}
              className="pointer-events-auto flex size-7 items-center justify-center rounded-full border border-foam/20 bg-ink/80 text-foam/80 hover:bg-ink hover:text-foam active:scale-95"
              aria-label={muted ? "Unmute sound" : "Mute sound"}
            >
              {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            </button>
            <button
              type="button"
              data-testid="circuit-map-button"
              className="pointer-events-auto flex items-center gap-1 rounded-full border border-foam/20 bg-ink/80 px-2.5 py-1 font-sans text-[0.62rem] font-black uppercase tracking-wider text-foam/90 hover:bg-ink active:scale-95"
              onClick={() => {
                inputManager.enabled = false;
                useGameStore.getState().setScreen("city-select");
              }}
            >
              <MapPin className="size-3 text-sand" />
              <span>Map</span>
            </button>
          </div>

          <p className="rounded-full border border-foam/15 bg-ink/80 px-2.5 py-0.5 font-sans text-[0.58rem] font-bold uppercase tracking-[0.14em] text-sand">
            {location}
          </p>
          <p className="rounded-full border border-foam/15 bg-ink/80 px-2.5 py-0.5 font-sans text-[0.58rem] font-bold uppercase tracking-wider text-foam">
            KO {kos} · {aliveEnemies} LEFT
          </p>

          {currentMove ? (
            <p className="rounded-full bg-royal/90 border border-purple-400/40 px-3 py-1 font-display text-sm tracking-wide text-foam shadow-[0_0_10px_rgba(107,46,160,0.6)]">
              {currentMove}
            </p>
          ) : null}

          {/* Dynamic Combo Tier Pill */}
          {comboHits >= 2 ? (
            <div className="flex flex-col items-end">
              <div
                className={`flex items-center gap-1.5 rounded-full border px-3 py-0.5 font-display text-base tracking-wider drop-shadow shadow-md ${
                  getComboRank(comboHits).color
                }`}
              >
                <span>{comboHits} HITS</span>
                <span className="text-xs font-sans font-black">
                  {getComboRank(comboHits).label}
                </span>
              </div>
            </div>
          ) : null}

          {flash ? (
            <p className="rounded-full bg-coral px-3 py-1 font-sans text-[0.65rem] font-black uppercase tracking-wider text-ink shadow-[0_0_15px_rgba(232,93,76,0.8)] animate-bounce">
              {flash}
            </p>
          ) : null}

          {debug ? (
            <p className="font-mono text-[0.65rem] tabular-nums text-sand">FPS {fps}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
