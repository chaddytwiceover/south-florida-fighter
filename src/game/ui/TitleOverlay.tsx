import { audioManager } from "../audio/AudioManager";
import { useGameStore } from "../systems/gameStore";

export function TitleOverlay() {
  const start = () => {
    audioManager.unlock();
    useGameStore.getState().setScreen("select");
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-ink/25 px-4 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="w-full max-w-md rounded-[1.6rem] border border-foam/15 bg-ink/82 px-5 py-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <p className="font-sans text-[0.68rem] font-bold uppercase tracking-[0.28em] text-sand">
          South Florida
        </p>
        <h1 className="mt-1 font-display text-6xl leading-none text-foam">Samurai</h1>
        <p className="mt-3 font-sans text-sm font-semibold text-foam/80">
          Portrait arcade brawler
        </p>
        <p className="mx-auto mt-2 max-w-sm font-sans text-sm leading-relaxed text-muted">
          JAV and KENO hit the Fort Lauderdale boardwalk. Combos, knockback, and
          a gauntlet of bruisers and skate rats.
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-5 inline-flex h-12 min-w-[10.5rem] items-center justify-center rounded-full bg-foam px-8 font-sans text-base font-extrabold uppercase tracking-[0.14em] text-ink transition-transform duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)] hover:bg-sand active:scale-[0.98]"
        >
          Choose fighter
        </button>
        <p className="mt-3 font-sans text-xs text-foam/55">
          A / D move · Space jump · J attack combo · K special
        </p>
      </div>
    </div>
  );
}
