import { ArrowRight } from "lucide-react";
import { audioManager } from "../audio/AudioManager";

export function Preloader({ ready, failed, onReady }: {
  ready: boolean;
  failed: boolean;
  onReady: () => void;
}) {
  return (
    <section aria-labelledby="loading-title" className="absolute inset-0 z-40 isolate flex flex-col justify-between overflow-y-auto bg-ink p-6 text-white">
      <img src="/game/backgrounds/fort-lauderdale/arena.webp" alt="" fetchPriority="high"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-[42%_center]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,19,30,.85),transparent_43%,rgba(7,19,30,.74)_68%,#07131e_90%)]" />
      <header className="flex items-center justify-between gap-3 border-t-2 border-sand pt-2 font-mono text-xs uppercase tracking-wider">
        <span>Florida circuit</span><span>Five arenas</span>
      </header>
      <div className="mt-16 pb-2">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-sand">Fort Lauderdale · A1A Boardwalk</p>
        <h1 id="loading-title" className="font-display text-[clamp(3rem,10vh,6rem)] uppercase leading-[.88]">
          South Florida<br /><span className="text-gold">Fighter</span>
        </h1>
        <p className="my-4 max-w-xs text-sm leading-snug">Fight across five cities. The Syndicate Kingpin waits on Ocean Drive.</p>
        <div aria-live="polite" className="mb-2 font-mono text-xs text-sand">
          {failed ? "The arena could not start." : ready ? "Opening arena ready" : "Preparing the opening arena…"}
        </div>
        <button type="button" disabled={!ready && !failed} onClick={() => {
          if (failed) return window.location.reload();
          audioManager.unlock();
          audioManager.roundAnnounce();
          onReady();
        }} className="flex min-h-12 w-full items-center justify-between bg-gold px-4 font-bold text-ink hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60">
          {failed ? "Retry loading" : "Enter Championship"}<ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
