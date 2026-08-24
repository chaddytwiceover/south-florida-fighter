import { CHARACTERS, getCharacter, type CharacterData } from "../characters/CharacterData";
import { audioManager } from "../audio/AudioManager";
import { restartPlayScene } from "../runtime";
import { useGameStore } from "../systems/gameStore";
import { cn } from "@/lib/utils";

function KitList({ character }: { character: CharacterData }) {
  return (
    <div className="grid grid-cols-1 gap-y-0.5 font-sans text-[0.58rem] font-bold uppercase tracking-wider text-foam/80">
      {character.attacks.map((move) => (
        <span key={move.id} className="truncate">
          {move.name}
        </span>
      ))}
      {character.specials.map((move) => (
        <span key={move.id} className="truncate text-gold">
          {move.name}
        </span>
      ))}
      <span className="truncate text-coral">{character.finisher.name}</span>
    </div>
  );
}

function FighterCard({
  character,
  selected,
  onSelect,
}: {
  character: CharacterData;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-testid={`fighter-${character.id}`}
      onClick={onSelect}
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.1rem] border p-2.5 text-left transition-transform duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]",
        selected
          ? "border-gold bg-ink/90 ring-2 ring-gold"
          : "border-foam/15 bg-ink/70 hover:border-foam/40",
      )}
    >
      <div className="flex min-h-0 items-center gap-2">
        <img
          src={character.portrait}
          alt=""
          className="size-14 shrink-0 rounded-[0.85rem] border border-foam/20 object-cover"
          draggable={false}
        />
        <div className="min-w-0">
          <p className="font-display text-3xl leading-none tracking-wide text-foam">
            {character.name}
          </p>
          <p className="font-sans text-[0.62rem] font-bold uppercase tracking-[0.16em] text-sand">
            {character.title}
          </p>
        </div>
      </div>
      <p className="mt-1 truncate font-sans text-[0.7rem] text-muted">{character.tagline}</p>
      <div className="mt-1 flex gap-3 font-sans text-[0.62rem] font-extrabold uppercase tracking-wider text-foam/70">
        <span>HP {character.health}</span>
        <span>SPD {character.movementSpeed}</span>
        <span>ATK {character.attackPower}</span>
      </div>
    </button>
  );
}

export function CharacterSelect() {
  const characterId = useGameStore((s) => s.characterId);
  const selected = getCharacter(characterId);

  const confirm = () => {
    audioManager.unlock();
    useGameStore.getState().applyCharacter(selected.id);
    useGameStore.getState().setScreen("play");
    window.setTimeout(() => restartPlayScene(), 80);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-stretch justify-center bg-ink/80 px-3 py-3">
      <div className="flex h-full w-full max-w-md flex-col gap-2">
        <div>
          <p className="font-sans text-[0.62rem] font-bold uppercase tracking-[0.22em] text-sand">
            South Florida Samurai
          </p>
          <h2 className="font-display text-4xl leading-none text-foam">Pick your fighter</h2>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {CHARACTERS.map((character) => (
            <FighterCard
              key={character.id}
              character={character}
              selected={character.id === selected.id}
              onSelect={() => useGameStore.getState().applyCharacter(character.id)}
            />
          ))}
        </div>

        <div className="rounded-[1rem] border border-foam/15 bg-ink/90 px-3 py-2">
          <KitList character={selected} />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => useGameStore.getState().setScreen("title")}
            className="h-11 rounded-full border border-foam/20 px-4 font-sans text-xs font-extrabold uppercase tracking-[0.14em] text-foam"
          >
            Back
          </button>
          <button
            type="button"
            data-testid="confirm-fighter"
            onClick={confirm}
            className="h-11 flex-1 rounded-full bg-foam px-6 font-sans text-sm font-extrabold uppercase tracking-[0.14em] text-ink hover:bg-sand"
          >
            Fight as {selected.name}
          </button>
        </div>
      </div>
    </div>
  );
}
