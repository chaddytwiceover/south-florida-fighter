import { useEffect } from "react";
import { getCharacter } from "../characters/CharacterData";
import { inputManager } from "../input/InputManager";
import { useGameStore } from "../systems/gameStore";

function Meter({
  label,
  value,
  max,
  barClass,
}: {
  label: string;
  value: number;
  max: number;
  barClass: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-sans text-[0.58rem] font-extrabold uppercase tracking-wider text-foam/70">
          {label}
        </span>
        <span className="font-sans text-[0.58rem] font-bold tabular-nums text-foam/55">
          {Math.round(value)}
        </span>
      </div>
      <div
        className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-ink-2 ring-1 ring-foam/15"
        role="meter"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
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
  const specialIndex = useGameStore((s) => s.specialIndex);
  const flash = useGameStore((s) => s.flash);
  const character = getCharacter(characterId);
  const nextSpecial = character.specials[specialIndex];
  const finisherReady = energy >= 100;

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => useGameStore.setState({ flash: "" }), 900);
    return () => window.clearTimeout(timer);
  }, [flash]);

  return (
    <div
      data-testid="hud"
      className="pointer-events-none absolute inset-x-0 top-0 z-20 p-[max(0.45rem,env(safe-area-inset-top))] px-[max(0.7rem,env(safe-area-inset-left))]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[1.2rem] border border-foam/15 bg-ink/75 p-1.5 pr-3">
          <div className="size-12 shrink-0 overflow-hidden rounded-[0.8rem] border border-gold/50 bg-ocean">
            <img
              src={portrait}
              alt=""
              className="size-full object-cover object-top"
              draggable={false}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl leading-none tracking-wide text-foam">
              {characterName}
            </p>
            <div className="mt-1 space-y-0.5">
              <Meter label="HP" value={health} max={maxHealth} barClass="bg-coral" />
              <Meter label="KI" value={energy} max={maxEnergy} barClass="bg-ocean-2" />
              <Meter label="XP" value={xp} max={100} barClass="bg-gold" />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="rounded-full border border-foam/15 bg-ink/70 px-2.5 py-1 font-sans text-[0.58rem] font-bold uppercase tracking-[0.12em] text-sand">
            {location}
          </p>
          <p className="rounded-full border border-foam/15 bg-ink/70 px-2.5 py-1 font-sans text-[0.58rem] font-bold uppercase tracking-wider text-foam">
            {finisherReady ? character.finisher.name : nextSpecial.name}
          </p>
          <p className="rounded-full border border-foam/15 bg-ink/70 px-2.5 py-1 font-sans text-[0.58rem] font-bold uppercase tracking-wider text-foam">
            KO {kos} · {aliveEnemies} left
          </p>
          {currentMove ? (
            <p className="rounded-full bg-royal px-3 py-1 font-display text-sm tracking-wide text-foam">
              {currentMove}
            </p>
          ) : null}
          {comboHits >= 2 ? (
            <p className="rounded-full bg-coral px-3 py-1 font-display text-sm tracking-wide text-ink">
              {comboHits} HIT
            </p>
          ) : null}
          {flash ? (
            <p className="rounded-full bg-coral px-3 py-1 font-sans text-[0.65rem] font-extrabold uppercase tracking-wider text-ink">
              {flash}
            </p>
          ) : null}
          {debug ? (
            <p className="font-mono text-[0.65rem] tabular-nums text-sand">FPS {fps}</p>
          ) : null}
          <button
            type="button"
            data-testid="roster-button"
            className="pointer-events-auto rounded-full border border-foam/20 bg-ink/70 px-3 py-1 font-sans text-[0.6rem] font-extrabold uppercase tracking-wider text-foam/80"
            onClick={() => {
              inputManager.enabled = false;
              useGameStore.getState().setScreen("select");
            }}
          >
            Roster
          </button>
        </div>
      </div>
    </div>
  );
}
