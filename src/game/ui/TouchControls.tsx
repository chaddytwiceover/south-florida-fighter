import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Settings,
  Shield,
  Sparkles,
  Sword,
  Zap,
  Flame,
} from "lucide-react";
import { useEffect, useState, type PointerEvent } from "react";
import { inputManager } from "../input/InputManager";
import { cn } from "@/lib/utils";

type HoldKey =
  | "touchLeft"
  | "touchRight"
  | "touchJump"
  | "touchAttack"
  | "touchHeavy"
  | "touchKick"
  | "touchSpecial"
  | "touchFinisher"
  | "touchGuard"
  | "touchParry"
  | "touchDash";

function holdHandlers(key: HoldKey) {
  return {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      inputManager.pressTouchAction(key, true);
    },
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      inputManager.pressTouchAction(key, false, false);
    },
    onPointerLeave: () => {
      inputManager.pressTouchAction(key, false, false);
    },
    onPointerCancel: () => {
      inputManager.pressTouchAction(key, false, false);
    },
    onLostPointerCapture: () => {
      inputManager.pressTouchAction(key, false, false);
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
        "touch-button",
        "pointer-events-auto select-none touch-none",
        "min-h-11 min-w-11 overflow-hidden",
        "flex flex-col items-center justify-center gap-0.5",
        "border border-foam/20 bg-ink/80 text-foam",
        "shadow-[0_6px_0_rgba(0,0,0,0.4),0_0_0_rgba(232,196,90,0)] backdrop-blur-sm",
        "transition-[transform,box-shadow,filter] duration-100",
        "active:translate-y-0.5 active:brightness-125 active:shadow-[0_2px_0_rgba(0,0,0,0.4),0_0_18px_rgba(232,196,90,0.55)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand",
        className,
      )}
      {...handlers}
    >
      {children}
    </button>
  );
}

const REMAP_OPTIONS = [
  ["light", "Light"],
  ["heavy", "Heavy"],
  ["dash", "Dash"],
  ["parry", "Parry"],
] as const;

export function TouchControls() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(() => inputManager.getSettings());
  const [remapping, setRemapping] = useState<(typeof REMAP_OPTIONS)[number][0] | null>(null);

  useEffect(() => {
    if (!remapping) return;
    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      inputManager.remapKeyboard(remapping, [event.code]);
      setSettings(inputManager.getSettings());
      setRemapping(null);
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [remapping]);

  const updateSettings = (next: Parameters<typeof inputManager.updateSettings>[0]) => {
    inputManager.updateSettings(next);
    setSettings(inputManager.getSettings());
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="absolute top-[max(4.25rem,env(safe-area-inset-top))] right-[max(0.6rem,env(safe-area-inset-right))] flex flex-col items-end gap-2">
        <button
          type="button"
          aria-label="Input settings"
          onClick={() => setSettingsOpen((value) => !value)}
          className="touch-button pointer-events-auto flex size-11 items-center justify-center rounded-2xl border border-foam/20 bg-ink/85 text-foam shadow-[0_6px_0_rgba(0,0,0,0.38)] backdrop-blur-sm active:translate-y-0.5 active:shadow-[0_2px_0_rgba(0,0,0,0.38),0_0_18px_rgba(20,145,155,0.55)]"
        >
          <Settings className="size-5" />
        </button>

        {settingsOpen ? (
          <div className="pointer-events-auto w-[min(17rem,calc(100vw-1.2rem))] rounded-2xl border border-foam/20 bg-ink/92 p-3 text-foam shadow-2xl backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gamepad2 className="size-4 text-sand" />
                <span className="font-sans text-xs font-black uppercase tracking-wider">
                  Input
                </span>
              </div>
              <span className="font-mono text-[0.62rem] text-foam/60">
                {Math.round(settings.touchSensitivity * 100)}%
              </span>
            </div>

            <label className="block space-y-1">
              <span className="font-sans text-[0.68rem] font-bold uppercase tracking-wider text-sand">
                Touch sensitivity
              </span>
              <input
                type="range"
                min="0.45"
                max="1.8"
                step="0.05"
                value={settings.touchSensitivity}
                onChange={(event) =>
                  updateSettings({ touchSensitivity: Number(event.currentTarget.value) })
                }
                className="w-full accent-coral"
              />
            </label>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-foam/15 bg-ink-2/80 px-2 text-[0.68rem] font-bold uppercase">
                <input
                  type="checkbox"
                  checked={settings.gesturesEnabled}
                  onChange={(event) =>
                    updateSettings({ gesturesEnabled: event.currentTarget.checked })
                  }
                  className="accent-coral"
                />
                Gestures
              </label>
              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-foam/15 bg-ink-2/80 px-2 text-[0.68rem] font-bold uppercase">
                <input
                  type="checkbox"
                  checked={settings.hapticsEnabled}
                  onChange={(event) =>
                    updateSettings({ hapticsEnabled: event.currentTarget.checked })
                  }
                  className="accent-coral"
                />
                Haptics
              </label>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {REMAP_OPTIONS.map(([action, label]) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => setRemapping(action)}
                  className={cn(
                    "min-h-11 rounded-xl border border-foam/15 bg-ink-2/85 px-2 text-left font-sans text-[0.66rem] font-black uppercase text-foam active:scale-95",
                    remapping === action && "border-gold text-gold shadow-[0_0_14px_rgba(232,196,90,0.35)]",
                  )}
                >
                  {remapping === action
                    ? "Press key"
                    : `${label}: ${settings.keyboard[action][0].replace("Key", "")}`}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Left Pad: Directional + Dash & Guard/Parry */}
      <div className="absolute bottom-[max(0.7rem,env(safe-area-inset-bottom))] left-[max(0.6rem,env(safe-area-inset-left))] flex flex-col gap-2">
        <div className="flex gap-2">
          <PadButton
            label="Dash"
            holdKey="touchDash"
            className="h-11 w-11 rounded-[0.9rem] bg-ocean/80 text-foam border-ocean-2"
          >
            <Zap className="size-5 text-amber-300" />
            <span className="font-sans text-[0.55rem] font-bold uppercase">Dash</span>
          </PadButton>

          <PadButton
            label="Guard / Parry"
            holdKey="touchParry"
            className="h-11 w-11 rounded-[0.9rem] bg-cyan-900/80 text-cyan-200 border-cyan-400/40"
          >
            <Shield className="size-5" />
            <span className="font-sans text-[0.55rem] font-bold uppercase">Parry</span>
          </PadButton>
        </div>

        <div className="flex gap-2">
          <PadButton
            label="Move left"
            holdKey="touchLeft"
            className="h-[3.9rem] w-[3.9rem] rounded-[1.2rem]"
          >
            <ChevronLeft className="size-7" strokeWidth={2.5} />
            <span className="font-sans text-[0.6rem] font-bold uppercase tracking-wider text-foam/70">
              Left
            </span>
          </PadButton>
          <PadButton
            label="Move right"
            holdKey="touchRight"
            className="h-[3.9rem] w-[3.9rem] rounded-[1.2rem]"
          >
            <ChevronRight className="size-7" strokeWidth={2.5} />
            <span className="font-sans text-[0.6rem] font-bold uppercase tracking-wider text-foam/70">
              Right
            </span>
          </PadButton>
        </div>
      </div>

      {/* Right Pad: Attack Actions Cluster + Jump */}
      <div className="absolute bottom-[max(0.7rem,env(safe-area-inset-bottom))] right-[max(0.6rem,env(safe-area-inset-right))] flex items-end gap-2">
        {/* Attack Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {/* Light Attack */}
          <PadButton
            label="Light Attack"
            holdKey="touchAttack"
            className="h-13 w-13 rounded-[1rem] bg-coral/90 text-ink shadow-[0_0_10px_rgba(232,93,76,0.5)]"
          >
            <Sword className="size-5" strokeWidth={2.4} />
            <span className="font-sans text-[0.55rem] font-black uppercase">Light</span>
          </PadButton>

          {/* Heavy Attack */}
          <PadButton
            label="Heavy Attack"
            holdKey="touchHeavy"
            className="h-13 w-13 rounded-[1rem] bg-rose-600/90 text-foam border-rose-400"
          >
            <Flame className="size-5" strokeWidth={2.4} />
            <span className="font-sans text-[0.55rem] font-black uppercase">Heavy</span>
          </PadButton>

          {/* Special Move */}
          <PadButton
            label="Special"
            holdKey="touchSpecial"
            className="h-12 w-12 rounded-[0.95rem] bg-purple-900/80 text-purple-200 border-purple-400/50"
          >
            <Sparkles className="size-4.5" strokeWidth={2.2} />
            <span className="font-sans text-[0.55rem] font-bold uppercase">Special</span>
          </PadButton>

          {/* Super Finisher */}
          <PadButton
            label="Super Finisher"
            holdKey="touchFinisher"
            className="h-12 w-12 rounded-[0.95rem] bg-amber-500/90 text-ink border-amber-300 shadow-[0_0_12px_rgba(232,196,90,0.8)]"
          >
            <Zap className="size-4.5 fill-ink" />
            <span className="font-sans text-[0.55rem] font-black uppercase">Super</span>
          </PadButton>
        </div>

        {/* Big Jump Button */}
        <PadButton
          label="Jump"
          holdKey="touchJump"
          className="h-[4.4rem] w-[4.4rem] rounded-[1.35rem] bg-ink/85 text-foam border-foam/30"
        >
          <ArrowUp className="size-7" strokeWidth={2.6} />
          <span className="font-sans text-[0.65rem] font-extrabold uppercase tracking-wider">
            Jump
          </span>
        </PadButton>
      </div>
    </div>
  );
}
