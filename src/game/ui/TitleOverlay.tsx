import { audioManager } from "../audio/AudioManager";
import { useGameStore } from "../systems/gameStore";
import { Play, Shield, Sparkles, Swords, Zap } from "lucide-react";

export function TitleOverlay() {
  const start = () => {
    audioManager.unlock();
    audioManager.roundAnnounce();
    useGameStore.getState().setScreen("select");
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-ink/40 px-4 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] select-none backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[1.8rem] border border-foam/20 bg-ink/90 px-6 py-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.65)] backdrop-blur-xl">
        {/* Subtitle / Location */}
        <div className="flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-coral animate-ping" />
          <p className="font-sans text-[0.68rem] font-black uppercase tracking-[0.32em] text-sand">
            South Florida Boardwalk
          </p>
        </div>

        {/* Title */}
        <h1 className="mt-1 font-display text-6xl leading-none tracking-wide text-foam drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          SAMURAI FIGHTER
        </h1>

        <div className="mx-auto my-3 flex max-w-xs items-center justify-center gap-4 text-xs font-bold text-foam/80 border-y border-foam/10 py-1.5 font-mono">
          <span className="flex items-center gap-1">
            <Zap className="size-3.5 text-gold" /> 2D FRAME ENGINE
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Shield className="size-3.5 text-cyan-400" /> JUST PARRY
          </span>
        </div>

        <p className="mx-auto mt-2 max-w-sm font-sans text-xs leading-relaxed text-muted">
          Master high/low mixups, frame-1 parries, combo cancels, and 808-powered super finishers on the Fort Lauderdale coast.
        </p>

        {/* Deploy Button */}
        <button
          type="button"
          onClick={start}
          className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-coral via-sand to-gold px-8 font-sans text-base font-black uppercase tracking-[0.18em] text-ink shadow-[0_0_25px_rgba(232,93,76,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="size-5 fill-ink" />
          <span>Enter Roster</span>
          <Sparkles className="size-4.5 text-ink" />
        </button>

        {/* Controls Quick Reference Table */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-foam/10 bg-ink-2/60 p-2.5 text-left font-sans text-[0.62rem] text-foam/75">
          <div>
            <span className="font-bold text-sand uppercase block mb-0.5">Keyboard</span>
            <span>A/D: Move · Space: Jump</span>
            <br />
            <span>J/K/L: Light/Heavy/Kick</span>
            <br />
            <span>F: Parry · S: Guard · E: Dash</span>
          </div>
          <div>
            <span className="font-bold text-sand uppercase block mb-0.5">Specials & Touch</span>
            <span>U/I/O: Specials 1-3</span>
            <br />
            <span>P / 4: Super Finisher</span>
            <br />
            <span>On-Screen Touch D-Pad</span>
          </div>
        </div>
      </div>
    </div>
  );
}
