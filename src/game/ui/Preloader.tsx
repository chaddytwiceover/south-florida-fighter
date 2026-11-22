import { ArrowRight } from "lucide-react";
import { audioManager } from "../audio/AudioManager";

export function Preloader({ ready, failed, onReady }: {
  ready: boolean;
  failed: boolean;
  onReady: () => void;
}) {
  return (
    <section aria-labelledby="loading-title" className="fight-program program-cover">
      <header className="program-line">Florida circuit <span>Championship program</span></header>
      <h1 id="loading-title">South Florida<br /><em>Fighter</em></h1>
      <figure className="cover-photo">
        <img alt="" fetchPriority="high" src="/game/backgrounds/fort-lauderdale/arena.webp" />
        <figcaption>A1A Ocean Boardwalk · Fort Lauderdale</figcaption>
      </figure>
      <div className="program-body">
        <div aria-live="polite" className="load-status">
          {failed ? "The opening arena could not load." : ready ? "Opening arena ready" : "Preparing the opening arena…"}
        </div>
        <button type="button" disabled={!ready && !failed} onClick={() => {
          if (failed) return window.location.reload();
          audioManager.unlock();
          audioManager.roundAnnounce();
          onReady();
        }} className="program-action">
          {failed ? "Retry loading" : "Enter Championship"}<ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
