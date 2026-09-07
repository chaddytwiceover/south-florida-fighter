import type { RawInputState } from "./InputBuffer";
import { clamp } from "../utils/math";

const GAME_CODES = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
  "Space",
  "KeyJ",
  "KeyK",
  "KeyL",
  "KeyU",
  "KeyI",
  "KeyO",
  "KeyP",
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyE",
  "KeyF",
  "KeyG",
  "ShiftLeft",
  "ShiftRight",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Escape",
  "Enter",
]);

export type GameActions = {
  moveX: number;
  moveY: number;
  jump: boolean;
  jumpPressed: boolean;
  attack: boolean;
  attackPressed: boolean;
  special: boolean;
  specialPressed: boolean;
  specialSlot: number | null;
  guard: boolean;
  parry: boolean;
  dash: boolean;
  pausePressed: boolean;
  raw: RawInputState;
};

type ActionName =
  | "left"
  | "right"
  | "up"
  | "down"
  | "jump"
  | "light"
  | "heavy"
  | "kick"
  | "special1"
  | "special2"
  | "special3"
  | "finisher"
  | "guard"
  | "parry"
  | "dash"
  | "pause";

export type InputSettings = {
  touchSensitivity: number;
  gesturesEnabled: boolean;
  hapticsEnabled: boolean;
  keyboard: Record<ActionName, string[]>;
  gamepad: {
    deadzone: number;
    light: number;
    heavy: number;
    kick: number;
    special1: number;
    special2: number;
    special3: number;
    finisher: number;
    guard: number;
    parry: number;
    dash: number;
    jump: number;
    pause: number;
  };
};

type TouchAction =
  | "touchLeft"
  | "touchRight"
  | "touchUp"
  | "touchDown"
  | "touchJump"
  | "touchAttack"
  | "touchHeavy"
  | "touchKick"
  | "touchSpecial"
  | "touchSpecial2"
  | "touchSpecial3"
  | "touchFinisher"
  | "touchGuard"
  | "touchParry"
  | "touchDash";

type PointerTrack = {
  id: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  startTime: number;
  longPressAt: number;
  longPressFired: boolean;
};

const DEFAULT_SETTINGS: InputSettings = {
  touchSensitivity: 1,
  gesturesEnabled: true,
  hapticsEnabled: true,
  keyboard: {
    left: ["ArrowLeft", "KeyA"],
    right: ["ArrowRight", "KeyD"],
    up: ["ArrowUp", "KeyW"],
    down: ["ArrowDown", "KeyS"],
    jump: ["Space", "ArrowUp", "KeyW"],
    light: ["KeyJ", "KeyZ"],
    heavy: ["KeyK", "KeyX"],
    kick: ["KeyL", "KeyC"],
    special1: ["Digit1", "KeyU"],
    special2: ["Digit2", "KeyI"],
    special3: ["Digit3", "KeyO"],
    finisher: ["Digit4", "KeyP"],
    guard: ["KeyS", "ShiftLeft", "ShiftRight", "KeyG"],
    parry: ["KeyF"],
    dash: ["KeyE"],
    pause: ["Escape"],
  },
  gamepad: {
    deadzone: 0.22,
    light: 0,
    heavy: 2,
    kick: 1,
    special1: 3,
    special2: 5,
    special3: 4,
    finisher: 7,
    guard: 6,
    parry: 8,
    dash: 9,
    jump: 0,
    pause: 9,
  },
};

const EMPTY_RAW: RawInputState = {
  left: false,
  right: false,
  up: false,
  down: false,
  light: false,
  heavy: false,
  kick: false,
  special1: false,
  special2: false,
  special3: false,
  finisher: false,
  guard: false,
  parry: false,
  dash: false,
};

const EMPTY: GameActions = {
  moveX: 0,
  moveY: 0,
  jump: false,
  jumpPressed: false,
  attack: false,
  attackPressed: false,
  special: false,
  specialPressed: false,
  specialSlot: null,
  guard: false,
  parry: false,
  dash: false,
  pausePressed: false,
  raw: EMPTY_RAW,
};

function cloneSettings(settings: InputSettings): InputSettings {
  return {
    ...settings,
    keyboard: Object.fromEntries(
      Object.entries(settings.keyboard).map(([key, value]) => [key, [...value]]),
    ) as InputSettings["keyboard"],
    gamepad: { ...settings.gamepad },
  };
}

function readSettings(): InputSettings {
  if (typeof window === "undefined") return cloneSettings(DEFAULT_SETTINGS);
  try {
    const saved = window.localStorage.getItem("sff.inputSettings");
    if (!saved) return cloneSettings(DEFAULT_SETTINGS);
    const parsed = JSON.parse(saved) as Partial<InputSettings>;
    return {
      ...cloneSettings(DEFAULT_SETTINGS),
      ...parsed,
      keyboard: {
        ...cloneSettings(DEFAULT_SETTINGS).keyboard,
        ...(parsed.keyboard ?? {}),
      },
      gamepad: {
        ...DEFAULT_SETTINGS.gamepad,
        ...(parsed.gamepad ?? {}),
      },
    };
  } catch {
    return cloneSettings(DEFAULT_SETTINGS);
  }
}

class InputManagerImpl {
  enabled = false;

  readonly keys = new Set<string>();
  readonly injected = new Set<string>();

  touchLeft = false;
  touchRight = false;
  touchUp = false;
  touchDown = false;
  touchMoveX = 0;
  touchJump = false;
  touchAttack = false;
  touchHeavy = false;
  touchKick = false;
  touchSpecial = false;
  touchSpecial2 = false;
  touchSpecial3 = false;
  touchFinisher = false;
  touchGuard = false;
  touchParry = false;
  touchDash = false;

  private settings: InputSettings = readSettings();
  private prevJump = false;
  private prevAttack = false;
  private prevSpecial = false;
  private prevPause = false;
  private prevSlot = [false, false, false, false];
  private bound = false;
  private phaserScene: Phaser.Scene | null = null;
  private phaserHandlers: Array<[string, (...args: any[]) => void]> = [];
  private pointers = new Map<number, PointerTrack>();
  private pointerPool: PointerTrack[] = [];
  private pulse = new Map<TouchAction, number>();
  private lastTapAt = 0;
  private pinchDistance = 0;
  private rotateAngle = 0;
  private last: GameActions = EMPTY;

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.isKnownCode(event.code)) event.preventDefault();
    if (event.repeat) return;
    this.keys.add(event.code);
  };

  private onKeyUp = (event: KeyboardEvent) => {
    if (this.isKnownCode(event.code)) event.preventDefault();
    this.keys.delete(event.code);
  };

  private onBlur = () => {
    this.keys.clear();
    this.injected.clear();
    this.clearTouch();
    this.pointers.clear();
  };

  bind() {
    if (this.bound || typeof window === "undefined") return;
    this.bound = true;
    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp, { passive: false });
    window.addEventListener("blur", this.onBlur);
    document.addEventListener("visibilitychange", this.onBlur);
  }

  enablePlay() {
    this.enabled = true;
    this.keys.clear();
    this.injected.clear();
    this.clearTouch();
    this.prevJump = true;
    this.prevAttack = true;
    this.prevSpecial = true;
    this.prevPause = true;
    this.prevSlot = [true, true, true, true];
  }

  unbind() {
    if (!this.bound) return;
    this.bound = false;
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    document.removeEventListener("visibilitychange", this.onBlur);
    this.detachPhaserScene();
    this.keys.clear();
    this.injected.clear();
  }

  attachPhaserScene(scene: Phaser.Scene) {
    this.detachPhaserScene();
    this.phaserScene = scene;
    const input = scene.input;
    input.addPointer(Math.max(0, 5 - input.manager.pointers.length));

    const down = (pointer: Phaser.Input.Pointer) => this.handlePointerDown(pointer);
    const move = (pointer: Phaser.Input.Pointer) => this.handlePointerMove(pointer);
    const up = (pointer: Phaser.Input.Pointer) => this.handlePointerUp(pointer);
    this.phaserHandlers = [
      ["pointerdown", down],
      ["pointermove", move],
      ["pointerup", up],
      ["pointerupoutside", up],
      ["pointercancel", up],
    ];
    for (const [eventName, handler] of this.phaserHandlers) input.on(eventName, handler);
  }

  detachPhaserScene() {
    if (!this.phaserScene) return;
    for (const [eventName, handler] of this.phaserHandlers) {
      this.phaserScene.input.off(eventName, handler);
    }
    this.phaserHandlers = [];
    this.phaserScene = null;
    this.pointers.clear();
  }

  getSettings() {
    return cloneSettings(this.settings);
  }

  updateSettings(next: Partial<InputSettings>) {
    this.settings = {
      ...this.settings,
      ...next,
      keyboard: {
        ...this.settings.keyboard,
        ...(next.keyboard ?? {}),
      },
      gamepad: {
        ...this.settings.gamepad,
        ...(next.gamepad ?? {}),
      },
    };
    this.settings.touchSensitivity = clamp(this.settings.touchSensitivity, 0.45, 1.8);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sff.inputSettings", JSON.stringify(this.settings));
    }
  }

  remapKeyboard(action: ActionName, codes: string[]) {
    this.updateSettings({
      keyboard: {
        ...this.settings.keyboard,
        [action]: codes,
      },
    });
    for (const code of codes) GAME_CODES.add(code);
  }

  setInjectedKeys(codes: string[]) {
    this.injected.clear();
    for (const code of codes) this.injected.add(code);
  }

  pressTouchAction(action: TouchAction, pressed: boolean, haptic = true) {
    this[action] = pressed;
    if (pressed && haptic) this.haptic(12);
  }

  haptic(ms = 12) {
    if (!this.settings.hapticsEnabled || typeof navigator === "undefined") return;
    navigator.vibrate?.(ms);
  }

  private isKnownCode(code: string) {
    if (GAME_CODES.has(code)) return true;
    return Object.values(this.settings.keyboard).some((codes) => codes.includes(code));
  }

  private clearTouch() {
    this.touchLeft = false;
    this.touchRight = false;
    this.touchUp = false;
    this.touchDown = false;
    this.touchMoveX = 0;
    this.touchJump = false;
    this.touchAttack = false;
    this.touchHeavy = false;
    this.touchKick = false;
    this.touchSpecial = false;
    this.touchSpecial2 = false;
    this.touchSpecial3 = false;
    this.touchFinisher = false;
    this.touchGuard = false;
    this.touchParry = false;
    this.touchDash = false;
    this.pulse.clear();
  }

  private downAction(action: ActionName) {
    return this.down(...this.settings.keyboard[action]);
  }

  private down(...codes: string[]) {
    for (const code of codes) {
      if (this.keys.has(code) || this.injected.has(code)) return true;
    }
    return false;
  }

  private getPooledPointer(id: number, x: number, y: number, now: number): PointerTrack {
    const item = this.pointerPool.pop() ?? {
      id: 0,
      startX: 0,
      startY: 0,
      x: 0,
      y: 0,
      startTime: 0,
      longPressAt: 0,
      longPressFired: false,
    };
    item.id = id;
    item.startX = x;
    item.startY = y;
    item.x = x;
    item.y = y;
    item.startTime = now;
    item.longPressAt = now + 440;
    item.longPressFired = false;
    return item;
  }

  private releasePointer(track: PointerTrack) {
    if (this.pointerPool.length < 12) this.pointerPool.push(track);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (!this.enabled) return;
    const now = performance.now();
    const track = this.getPooledPointer(pointer.id, pointer.x, pointer.y, now);
    this.pointers.set(pointer.id, track);
    this.updatePinchRotateBase();
    this.haptic(8);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    const track = this.pointers.get(pointer.id);
    if (!track || !this.enabled) return;
    track.x = pointer.x;
    track.y = pointer.y;

    const dx = (track.x - track.startX) * this.settings.touchSensitivity;
    const dy = (track.y - track.startY) * this.settings.touchSensitivity;
    if (Math.abs(dx) > 18) this.touchMoveX = clamp(dx / 80, -1, 1);
    if (dy < -42) this.pulse.set("touchJump", 2);
    if (dy > 48) this.touchGuard = true;

    if (this.settings.gesturesEnabled && !track.longPressFired && performance.now() > track.longPressAt) {
      track.longPressFired = true;
      this.pulse.set("touchParry", 3);
      this.haptic(24);
    }

    this.updatePinchRotateGesture();
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer) {
    const track = this.pointers.get(pointer.id);
    if (!track) return;
    const now = performance.now();
    const dx = (track.x - track.startX) * this.settings.touchSensitivity;
    const dy = (track.y - track.startY) * this.settings.touchSensitivity;
    const distance = Math.hypot(dx, dy);
    const elapsed = now - track.startTime;

    if (this.settings.gesturesEnabled) {
      if (elapsed < 220 && distance < 18) {
        if (now - this.lastTapAt < 260) {
          this.pulse.set("touchDash", 3);
          this.haptic(18);
        } else {
          this.pulse.set("touchAttack", 2);
          this.haptic(10);
        }
        this.lastTapAt = now;
      } else if (distance > 54 && elapsed < 480) {
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) this.pulse.set("touchLeft", 3);
          else this.pulse.set("touchRight", 3);
        } else if (dy < 0) {
          this.pulse.set("touchJump", 3);
        } else {
          this.pulse.set("touchGuard", 3);
        }
        this.haptic(16);
      }
    }

    this.pointers.delete(pointer.id);
    this.releasePointer(track);
    this.touchMoveX = 0;
    this.touchGuard = false;
    this.updatePinchRotateBase();
  }

  private activePointers() {
    return Array.from(this.pointers.values());
  }

  private updatePinchRotateBase() {
    const active = this.activePointers();
    if (active.length < 2) {
      this.pinchDistance = 0;
      this.rotateAngle = 0;
      return;
    }
    const [a, b] = active;
    this.pinchDistance = Math.hypot(b.x - a.x, b.y - a.y);
    this.rotateAngle = Math.atan2(b.y - a.y, b.x - a.x);
  }

  private updatePinchRotateGesture() {
    if (!this.settings.gesturesEnabled) return;
    const active = this.activePointers();
    if (active.length < 2 || this.pinchDistance <= 0) return;
    const [a, b] = active;
    const nextDistance = Math.hypot(b.x - a.x, b.y - a.y);
    const distanceDelta = nextDistance - this.pinchDistance;
    if (Math.abs(distanceDelta) > 42) {
      this.pulse.set(distanceDelta > 0 ? "touchSpecial2" : "touchSpecial3", 2);
      this.pinchDistance = nextDistance;
      this.haptic(12);
    }

    const nextAngle = Math.atan2(b.y - a.y, b.x - a.x);
    const angleDelta = Math.atan2(
      Math.sin(nextAngle - this.rotateAngle),
      Math.cos(nextAngle - this.rotateAngle),
    );
    if (Math.abs(angleDelta) > 0.38) {
      this.pulse.set("touchFinisher", 2);
      this.rotateAngle = nextAngle;
      this.haptic(20);
    }
  }

  private pulseActive(action: TouchAction) {
    const frames = this.pulse.get(action) ?? 0;
    return frames > 0;
  }

  private decayPulses() {
    for (const [action, frames] of this.pulse) {
      if (frames <= 1) this.pulse.delete(action);
      else this.pulse.set(action, frames - 1);
    }
  }

  private gamepadButton(index: number) {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return false;
    for (const pad of navigator.getGamepads()) {
      if (!pad) continue;
      const button = pad.buttons[index];
      if (button?.pressed || (button?.value ?? 0) > 0.5) return true;
    }
    return false;
  }

  private gamepadAxis(axisIndex: number) {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return 0;
    let value = 0;
    for (const pad of navigator.getGamepads()) {
      if (!pad) continue;
      const axis = pad.axes[axisIndex] ?? 0;
      if (Math.abs(axis) > Math.abs(value)) value = axis;
    }
    return Math.abs(value) > this.settings.gamepad.deadzone ? value : 0;
  }

  poll(): GameActions {
    if (!this.enabled) {
      this.prevJump = false;
      this.prevAttack = false;
      this.prevSpecial = false;
      this.prevPause = false;
      this.prevSlot = [false, false, false, false];
      this.last = EMPTY;
      return EMPTY;
    }

    const padX = this.gamepadAxis(0);
    const padY = this.gamepadAxis(1);
    const left =
      this.downAction("left") ||
      this.touchLeft ||
      this.pulseActive("touchLeft") ||
      padX < -this.settings.gamepad.deadzone;
    const right =
      this.downAction("right") ||
      this.touchRight ||
      this.pulseActive("touchRight") ||
      padX > this.settings.gamepad.deadzone;
    const up =
      this.downAction("up") ||
      this.touchUp ||
      this.touchJump ||
      this.pulseActive("touchJump") ||
      padY < -this.settings.gamepad.deadzone;
    const down =
      this.downAction("down") ||
      this.touchDown ||
      this.pulseActive("touchGuard") ||
      padY > this.settings.gamepad.deadzone;

    let moveX = 0;
    if (left) moveX -= 1;
    if (right) moveX += 1;
    if (moveX === 0 && Math.abs(this.touchMoveX) > 0.2) moveX = this.touchMoveX;
    if (moveX === 0 && Math.abs(padX) > this.settings.gamepad.deadzone) moveX = padX;
    moveX = clamp(moveX, -1, 1);

    const jump =
      this.downAction("jump") ||
      this.touchJump ||
      this.pulseActive("touchJump") ||
      this.gamepadButton(this.settings.gamepad.jump);
    const light =
      this.downAction("light") ||
      this.touchAttack ||
      this.pulseActive("touchAttack") ||
      this.gamepadButton(this.settings.gamepad.light);
    const heavy =
      this.downAction("heavy") ||
      this.touchHeavy ||
      this.gamepadButton(this.settings.gamepad.heavy);
    const kick =
      this.downAction("kick") ||
      this.touchKick ||
      this.gamepadButton(this.settings.gamepad.kick);

    const special1 =
      this.downAction("special1") ||
      this.touchSpecial ||
      this.gamepadButton(this.settings.gamepad.special1);
    const special2 =
      this.downAction("special2") ||
      this.touchSpecial2 ||
      this.pulseActive("touchSpecial2") ||
      this.gamepadButton(this.settings.gamepad.special2);
    const special3 =
      this.downAction("special3") ||
      this.touchSpecial3 ||
      this.pulseActive("touchSpecial3") ||
      this.gamepadButton(this.settings.gamepad.special3);
    const finisher =
      this.downAction("finisher") ||
      this.touchFinisher ||
      this.pulseActive("touchFinisher") ||
      this.gamepadButton(this.settings.gamepad.finisher);

    const guard =
      this.downAction("guard") ||
      this.touchGuard ||
      this.gamepadButton(this.settings.gamepad.guard);
    const parry =
      this.downAction("parry") ||
      this.touchParry ||
      this.pulseActive("touchParry") ||
      this.gamepadButton(this.settings.gamepad.parry);
    const dash =
      this.downAction("dash") ||
      this.touchDash ||
      this.pulseActive("touchDash") ||
      this.gamepadButton(this.settings.gamepad.dash);
    const pause = this.downAction("pause") || this.gamepadButton(this.settings.gamepad.pause);

    const specialSlotHeld = [special1, special2, special3, finisher];
    let specialSlot: number | null = null;
    for (let i = 0; i < 4; i += 1) {
      if (specialSlotHeld[i] && !this.prevSlot[i]) specialSlot = i;
    }

    const raw: RawInputState = {
      left,
      right,
      up,
      down,
      light,
      heavy,
      kick,
      special1,
      special2,
      special3,
      finisher,
      guard,
      parry,
      dash,
    };

    const anyAttack = light || heavy || kick;
    const anySpecial = special1 || special2 || special3 || finisher;

    const actions: GameActions = {
      moveX,
      moveY: down ? 1 : up ? -1 : 0,
      jump,
      jumpPressed: jump && !this.prevJump,
      attack: anyAttack,
      attackPressed: anyAttack && !this.prevAttack,
      special: anySpecial,
      specialPressed: anySpecial && !this.prevSpecial,
      specialSlot,
      guard,
      parry,
      dash,
      pausePressed: pause && !this.prevPause,
      raw,
    };

    this.prevJump = jump;
    this.prevAttack = anyAttack;
    this.prevSpecial = anySpecial;
    this.prevPause = pause;
    this.prevSlot = specialSlotHeld;
    this.decayPulses();
    this.last = actions;
    return actions;
  }

  snapshot() {
    return this.last;
  }
}

export const inputManager = new InputManagerImpl();
