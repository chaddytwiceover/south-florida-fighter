import { audioManager } from "../audio/AudioManager";
import { useGameStore } from "../systems/gameStore";
import { MapPin, Play, Shield, Sparkles, Zap, Flame } from "lucide-react";

export function TitleOverlay() {
  const start = () => {
    audioManager.unlock();
    audioManager.roundAnnounce();
    useGameStore.getState().setScreen("city-select");
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center px-4 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] select-none">
      {/* Background Graphic Backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-ink">
        <img
          src="/game/backgrounds/title.jpg"
          alt=""
          className="size-full object-cover opacity-60 scale-105 transition-transform duration-1000 ease-out"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      </div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-foam/25 bg-ink/90 px-6 py-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {/* Header Ribbon */}
        <div className="flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-coral animate-ping" />
          <p className="font-sans text-[0.68rem] font-black uppercase tracking-[0.32em] text-sand">
            5-City Florida Circuit Championship
          </p>
        </div>

        {/* Title Badge */}
        <h1 className="mt-1 font-display text-6xl leading-none tracking-wide text-foam drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          SOUTH FLORIDA
        </h1>
        <h2 className="font-display text-5xl leading-none tracking-widest text-gold -mt-1 drop-shadow-[0_0_20px_rgba(232,196,90,0.6)]">
          FIGHTER
        </h2>

        {/* Feature Badges */}
        <div className="mx-auto my-3 flex max-w-xs items-center justify-center gap-3 text-xs font-bold text-foam/80 border-y border-foam/15 py-1.5 font-mono">
          <span className="flex items-center gap-1 text-gold">
            <Zap className="size-3.5" /> 5 CITIES
          </span>
          <span>·</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <Shield className="size-3.5" /> JUST PARRY
          </span>
          <span>·</span>
          <span className="flex items-center gap-1 text-coral">
            <Flame className="size-3.5" /> BOSS RAID
          </span>
        </div>

        <p className="mx-auto mt-2 max-w-sm font-sans text-xs leading-relaxed text-muted">
          Fight across Fort Lauderdale, Tampa, Palm Beach, Miami, and Miami Beach. Master frame-1 parries, launcher air juggles, and seismic finishers.
        </p>

        {/* Enter Circuit Button */}
        <button
          type="button"
          onClick={start}
          className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-coral via-sand to-gold px-8 font-sans text-base font-black uppercase tracking-[0.18em] text-ink shadow-[0_0_25px_rgba(232,93,76,0.7)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <MapPin className="size-5 fill-ink" />
          <span>Enter Florida Circuit</span>
          <Sparkles className="size-4.5 text-ink" />
        </button>

        {/* Controls Reference */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-foam/10 bg-ink-2/70 p-2.5 text-left font-sans text-[0.62rem] text-foam/75">
          <div>
            <span className="font-bold text-sand uppercase block mb-0.5">Desktop Keyboard</span>
            <span>A/D: Move · Space: Jump</span>
            <br />
            <span>J/K/L: Light/Heavy/Kick</span>
            <br />
            <span>F: Parry · S: Guard · E: Dash</span>
          </div>
          <div>
            <span className="font-bold text-sand uppercase block mb-0.5">Specials & Mobile</span>
            <span>U/I/O: Specials 1-3</span>
            <br />
            <span>P / 4: Super Finisher</span>
            <br />
            <span>Virtual D-Pad & Swipes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
