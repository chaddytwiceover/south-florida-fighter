import { useEffect, useState } from "react";
import { audioManager } from "../audio/AudioManager";
import { useGameStore } from "../systems/gameStore";
import { Play, Sparkles, Volume2, Shield, Zap } from "lucide-react";

const TIPS = [
  "Tip: Cancel any Normal Attack (Light/Heavy/Kick) into a Special or Finisher on hit!",
  "Tip: Tap Parry (F / Shield) right before an impact for a Frame-1 Just Parry and +25 KI!",
  "Tip: Double-tap Forward or press Dash (E) to phase through enemy attacks with iFrames!",
  "Tip: Hold Guard (S / Shift) to block high attacks; crouch guard to block low sweeps!",
  "Tip: At 100% KI, unleash your Unblockable Super Finisher (P / 4) for massive damage!",
];

export function Preloader({ onReady }: { onReady: () => void }) {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Simulated smooth asset preloading
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setLoaded(true);
          return 100;
        }
        return p + Math.floor(Math.random() * 18 + 12);
      });
    }, 90);

    const tipTimer = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 2800);

    return () => {
      clearInterval(interval);
      clearInterval(tipTimer);
    };
  }, []);

  const handleStart = () => {
    audioManager.unlock();
    audioManager.roundAnnounce();
    onReady();
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-between bg-ink px-4 py-8 text-foam select-none">
      {/* Background Cyber Grid Lines */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ocean/20 via-ink to-ink opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(11,110,122,0.05)_50%,transparent_100%)] bg-[length:100%_4px]" />

      {/* Top Header */}
      <div className="relative z-10 flex w-full max-w-md items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-ping rounded-full bg-coral" />
          <span className="font-sans text-[0.65rem] font-extrabold uppercase tracking-[0.24em] text-sand">
            South Florida Arcade Engine v2.0
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-foam/60">
          <Zap className="size-3.5 text-gold" />
          <span className="font-mono text-[0.68rem]">60 FPS LOCKED</span>
        </div>
      </div>

      {/* Center Logo & Loading Graphics */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-ocean-2/20 blur-xl animate-pulse" />
          <Shield className="size-16 text-foam drop-shadow-[0_0_15px_rgba(20,145,155,0.8)]" />
        </div>

        <p className="font-sans text-xs font-black uppercase tracking-[0.38em] text-coral drop-shadow">
          Fort Lauderdale Boardwalk
        </p>
        <h1 className="font-display text-6xl tracking-wider text-foam sm:text-7xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          SOUTH FLORIDA
        </h1>
        <h2 className="font-display text-5xl tracking-widest text-gold -mt-2 drop-shadow-[0_0_20px_rgba(232,196,90,0.6)]">
          FIGHTER
        </h2>
      </div>

      {/* Bottom Loading Progress & Tip Box */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-4">
        {!loaded ? (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-[0.7rem] font-bold uppercase tracking-wider text-foam/80">
              <span>Loading Arena Assets & Audio DSP...</span>
              <span className="font-mono text-sand">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-2 ring-1 ring-foam/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-ocean-2 via-gold to-coral transition-all duration-150 ease-out shadow-[0_0_12px_rgba(232,93,76,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-coral via-sand to-gold px-8 font-sans text-base font-black uppercase tracking-[0.2em] text-ink shadow-[0_0_30px_rgba(232,93,76,0.6)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="size-5 fill-ink" />
            <span>Enter Arena</span>
            <Sparkles className="size-5 animate-spin text-ink" />
          </button>
        )}

        {/* Tip Ticker */}
        <div className="min-h-[2.8rem] w-full rounded-xl border border-foam/10 bg-ink-2/80 px-3.5 py-2 text-center shadow-inner">
          <p className="font-sans text-[0.7rem] font-medium leading-tight text-foam/85 transition-opacity duration-300">
            {TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
