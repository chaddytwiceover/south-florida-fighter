import { JAV } from "../characters/CharacterData";
import { getFrameKit } from "../combat/FrameData";
import { useGameStore } from "../systems/gameStore";
import { ArrowLeft, Play, Shield, Sparkles, Zap } from "lucide-react";

export function CharacterSelect() {
  const frameKit = getFrameKit();

  return (
    <div className="absolute inset-0 z-30 flex items-stretch justify-center bg-ink/90 px-3 py-4 select-none backdrop-blur-md">
      <div className="flex h-full w-full max-w-md flex-col justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-coral animate-ping" />
            <p className="font-sans text-[0.62rem] font-bold uppercase tracking-[0.26em] text-sand">
              Fighter Dossier
            </p>
          </div>
          <h2 className="font-display text-4xl leading-none text-foam">
            {JAV.name} · {JAV.title}
          </h2>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-gold/40 bg-ink-2/80 p-3 shadow-lg">
          <div className="size-20 overflow-hidden rounded-xl border border-gold bg-ocean">
            <img src={JAV.portrait} alt="" className="size-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl text-foam">{JAV.name}</p>
            <p className="font-sans text-xs text-muted leading-tight">{JAV.tagline}</p>
            <div className="mt-1.5 flex gap-2 font-mono text-[0.62rem] text-sand">
              <span>HP {JAV.health}</span>
              <span>·</span>
              <span>SPD {JAV.movementSpeed}</span>
              <span>·</span>
              <span>ATK {JAV.attackPower}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-2xl border border-foam/15 bg-ink/75 p-3 font-sans text-xs text-foam/80 space-y-2">
          <p className="font-black text-sand uppercase text-[0.7rem] tracking-wider">
            Combat Moves & Frame Data
          </p>
          <div className="grid grid-cols-1 gap-1 font-mono text-[0.65rem]">
            <div className="flex justify-between border-b border-foam/10 pb-1">
              <span>{frameKit.light.name} (J)</span>
              <span className="text-sand">{frameKit.light.damage} DMG · HIGH</span>
            </div>
            <div className="flex justify-between border-b border-foam/10 pb-1">
              <span>{frameKit.heavy.name} (K)</span>
              <span className="text-sand">{frameKit.heavy.damage} DMG · MID</span>
            </div>
            <div className="flex justify-between border-b border-foam/10 pb-1">
              <span>{frameKit.kick.name} (L)</span>
              <span className="text-sand">{frameKit.kick.damage} DMG · LOW</span>
            </div>
            <div className="flex justify-between border-b border-foam/10 pb-1 text-cyan-300">
              <span>{frameKit.special1.name} (U)</span>
              <span>{frameKit.special1.damage} DMG · 25 KI</span>
            </div>
            <div className="flex justify-between border-b border-foam/10 pb-1 text-cyan-300">
              <span>{frameKit.special2.name} (I)</span>
              <span>{frameKit.special2.damage} DMG · 30 KI</span>
            </div>
            <div className="flex justify-between border-b border-foam/10 pb-1 text-cyan-300">
              <span>{frameKit.special3.name} (O)</span>
              <span>{frameKit.special3.damage} DMG · 20 KI</span>
            </div>
            <div className="flex justify-between text-amber-300 font-bold">
              <span>{frameKit.finisher.name} (P)</span>
              <span>{frameKit.finisher.damage} DMG · 100 KI</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => useGameStore.getState().setScreen("title")}
            className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border border-foam/20 font-sans text-xs font-bold uppercase tracking-wider text-foam hover:bg-ink active:scale-95"
          >
            <ArrowLeft className="size-4" />
            <span>Title</span>
          </button>
          <button
            type="button"
            onClick={() => useGameStore.getState().setScreen("city-select")}
            className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-coral via-sand to-gold font-sans text-xs font-black uppercase tracking-wider text-ink shadow-[0_0_20px_rgba(232,93,76,0.5)] active:scale-95"
          >
            <Play className="size-4 fill-ink" />
            <span>Select City</span>
          </button>
        </div>
      </div>
    </div>
  );
}
