import { ArrowUp, ChevronLeft, ChevronRight, Sparkles, Sword } from "lucide-react";
import type { PointerEvent } from "react";
import { inputManager } from "../input/InputManager";
import { cn } from "@/lib/utils";

type HoldKey =
  | "touchLeft"
  | "touchRight"
  | "touchJump"
  | "touchAttack"
  | "touchSpecial";

function holdHandlers(key: HoldKey) {
  return {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      inputManager[key] = true;
    },
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      inputManager[key] = false;
    },
    onPointerCancel: () => {
      inputManager[key] = false;
    },
  };
}

function PadButton({
  label,
  holdKey,
  className,
  children,
}: {
  label: string;
  holdKey: HoldKey;
  className?: string;
  children: React.ReactNode;
}) {
  const handlers = holdHandlers(holdKey);
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "pointer-events-auto select-none touch-none",
        "flex flex-col items-center justify-center gap-0.5",
        "border border-foam/20 bg-ink/70 text-foam",
        "shadow-[0_6px_0_rgba(0,0,0,0.35)]",
        "active:translate-y-0.5 active:shadow-[0_3px_0_rgba(0,0,0,0.35)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand",
        className,
      )}
      {...handlers}
    >
      {children}
    </button>
  );
}

export function TouchControls() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="absolute bottom-[max(0.9rem,env(safe-area-inset-bottom))] left-[max(0.7rem,env(safe-area-inset-left))] flex gap-2.5">
        <PadButton
          label="Move left"
          holdKey="touchLeft"
          className="h-[4.25rem] w-[4.25rem] rounded-[1.3rem]"
        >
          <ChevronLeft className="size-8" strokeWidth={2.5} />
          <span className="font-sans text-[0.65rem] font-bold uppercase tracking-wider text-foam/70">
            Left
          </span>
        </PadButton>
        <PadButton
          label="Move right"
          holdKey="touchRight"
          className="h-[4.25rem] w-[4.25rem] rounded-[1.3rem]"
        >
          <ChevronRight className="size-8" strokeWidth={2.5} />
          <span className="font-sans text-[0.65rem] font-bold uppercase tracking-wider text-foam/70">
            Right
          </span>
        </PadButton>
      </div>

      <div className="absolute bottom-[max(0.9rem,env(safe-area-inset-bottom))] right-[max(0.7rem,env(safe-area-inset-right))] flex items-end gap-2.5">
        <div className="flex flex-col gap-2">
          <PadButton
            label="Attack"
            holdKey="touchAttack"
            className="h-16 w-16 rounded-[1.15rem] bg-coral/90 text-ink"
          >
            <Sword className="size-6" strokeWidth={2.2} />
            <span className="font-sans text-[0.6rem] font-extrabold uppercase tracking-wider">
              Attack
            </span>
          </PadButton>
          <PadButton
            label="Special"
            holdKey="touchSpecial"
            className="h-14 w-14 rounded-[1.1rem] bg-ink/55"
          >
            <Sparkles className="size-5" strokeWidth={2.2} />
            <span className="font-sans text-[0.6rem] font-bold uppercase tracking-wider text-foam/60">
              Special
            </span>
          </PadButton>
        </div>
        <PadButton
          label="Jump"
          holdKey="touchJump"
          className="h-[4.8rem] w-[4.8rem] rounded-[1.5rem] bg-ink/75 text-foam"
        >
          <ArrowUp className="size-7" strokeWidth={2.6} />
          <span className="font-sans text-[0.7rem] font-extrabold uppercase tracking-wider">
            Jump
          </span>
        </PadButton>
      </div>
    </div>
  );
}
