import { CHARACTERS, getCharacter, type CharacterData } from "../characters/CharacterData";
import { getFrameKit } from "../combat/FrameData";
import { audioManager } from "../audio/AudioManager";
import { restartPlayScene } from "../runtime";
import { useGameStore } from "../systems/gameStore";
import { cn } from "@/lib/utils";
import { Shield, Sparkles, Swords, Zap, ArrowLeft, Play } from "lucide-react";

function MoveBadge({ name, level, cost }: { name: string; level: string; cost?: number }) {
  const getLevelColor = (lvl: string) => {
    if (lvl === "overhead") return "text-purple-300 bg-purple-900/40 border-purple-500/30";
    if (lvl === "low") return "text-cyan-300 bg-cyan-900/40 border-cyan-500/30";
    if (lvl === "unblockable") return "text-amber-300 bg-amber-900/50 border-amber-400 animate-pulse";
    return "text-foam/80 bg-ink-2/60 border-foam/10";
  };

  return (
    <div className={cn("flex items-center justify-between rounded-lg border px-2 py-1 text-[0.62rem]", getLevelColor(level))}>
      <span className="font-bold truncate">{name}</span>
      <div className="flex items-center gap-1">
        {cost ? <span className="font-mono text-gold">{cost} KI</span> : null}
        <span className="font-mono uppercase text-[0.55rem] tracking-wider opacity-75">{level}</span>
      </div>
    </div>
  );
}

export function CharacterSelect() {
  const characterId = useGameStore((s) => s.characterId);
  const selected = getCharacter(characterId);
  const frameKit = getFrameKit(selected.id);

  const confirm = () => {
    audioManager.unlock();
    audioManager.roundAnnounce();
    useGameStore.getState().applyCharacter(selected.id);
    useGameStore.getState().setScreen("play");
    window.setTimeout(() => restartPlayScene(), 80);
  };

  const handleSelect = (id: string) => {
    audioManager.unlock();
    audioManager.swing(1.2);
    useGameStore.getState().applyCharacter(id);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-stretch justify-center bg-ink/90 px-3 py-3 select-none backdrop-blur-md">
      <div className="flex h-full w-full max-w-md flex-col justify-between gap-2.5">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-coral animate-ping" />
            <p className="font-sans text-[0.62rem] font-bold uppercase tracking-[0.24em] text-sand">
              Select Combatant
            </p>
          </div>
          <h2 className="font-display text-4xl leading-none text-foam">Choose Your Fighter</h2>
        </div>

        {/* Fighter Cards Roster */}
        <div className="grid grid-cols-2 gap-2.5">
          {CHARACTERS.map((char) => {
            const isSelected = char.id === selected.id;
            return (
              <button
                key={char.id}
                type="button"
                data-testid={`fighter-${char.id}`}
                onClick={() => handleSelect(char.id)}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-2xl border p-2.5 text-left transition-all duration-200",
                  isSelected
                    ? "border-gold bg-ink/95 shadow-[0_0_20px_rgba(232,196,90,0.35)] ring-2 ring-gold scale-[1.02]"
                    : "border-foam/15 bg-ink/70 hover:border-foam/40 hover:bg-ink/80",
                )}
              >
                <div className="relative mb-2 size-18 overflow-hidden rounded-xl border border-foam/20 bg-ocean">
                  <img
                    src={char.portrait}
                    alt=""
                    className="size-full object-cover object-top"
                    draggable={false}
                  />
                  {isSelected ? (
                    <div className="absolute top-1 right-1 rounded-full bg-gold p-1 shadow">
                      <Sparkles className="size-3 text-ink" />
                    </div>
                  ) : null}
                </div>

                <p className="font-display text-2xl leading-none text-foam">{char.name}</p>
                <p className="font-sans text-[0.6rem] font-bold uppercase tracking-wider text-sand truncate">
                  {char.title}
                </p>

                <div className="mt-2 grid grid-cols-3 gap-1 border-t border-foam/10 pt-1.5 text-center font-mono text-[0.58rem] text-foam/70">
                  <div>
                    <span className="block opacity-60">HP</span>
                    <span className="font-bold text-coral">{char.health}</span>
                  </div>
                  <div>
                    <span className="block opacity-60">SPD</span>
                    <span className="font-bold text-cyan-400">{char.movementSpeed}</span>
                  </div>
                  <div>
                    <span className="block opacity-60">ATK</span>
                    <span className="font-bold text-gold">{char.attackPower}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Kit & Move Details */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-foam/15 bg-ink/80 p-3 shadow-inner">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-sans text-[0.68rem] font-black uppercase tracking-wider text-sand">
              {selected.name} · Frame Data Kit
            </span>
            <span className="text-[0.6rem] font-medium text-foam/60">{selected.tagline}</span>
          </div>

          <div className="space-y-1.5">
            <MoveBadge name={frameKit.light.name} level={frameKit.light.level} />
            <MoveBadge name={frameKit.heavy.name} level={frameKit.heavy.level} />
            <MoveBadge name={frameKit.kick.name} level={frameKit.kick.level} />
            <MoveBadge name={frameKit.special1.name} level={frameKit.special1.level} cost={frameKit.special1.kiCost} />
            <MoveBadge name={frameKit.special2.name} level={frameKit.special2.level} cost={frameKit.special2.kiCost} />
            <MoveBadge name={frameKit.special3.name} level={frameKit.special3.level} cost={frameKit.special3.kiCost} />
            <MoveBadge name={frameKit.finisher.name} level={frameKit.finisher.level} cost={frameKit.finisher.kiCost} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => useGameStore.getState().setScreen("title")}
            className="flex h-12 items-center justify-center gap-1.5 rounded-xl border border-foam/20 px-4 font-sans text-xs font-bold uppercase tracking-wider text-foam hover:bg-ink active:scale-95"
          >
            <ArrowLeft className="size-4" />
            <span>Title</span>
          </button>

          <button
            type="button"
            data-testid="confirm-fighter"
            onClick={confirm}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-coral via-sand to-gold px-6 font-sans text-sm font-black uppercase tracking-[0.16em] text-ink shadow-[0_0_20px_rgba(232,93,76,0.5)] transition-all hover:scale-[1.01] active:scale-[0.98]"
          >
            <Play className="size-4.5 fill-ink" />
            <span>Deploy {selected.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
