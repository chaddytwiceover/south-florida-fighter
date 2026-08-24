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

  private prevJump = false;
  private prevAttack = false;
  private prevSpecial = false;
  private prevPause = false;
  private prevSlot = [false, false, false, false];
  private bound = false;
  private last: GameActions = EMPTY;

  private onKeyDown = (event: KeyboardEvent) => {
    if (GAME_CODES.has(event.code)) event.preventDefault();
    if (event.repeat) return;
    this.keys.add(event.code);
  };

  private onKeyUp = (event: KeyboardEvent) => {
    if (GAME_CODES.has(event.code)) event.preventDefault();
    this.keys.delete(event.code);
  };

  private onBlur = () => {
    this.keys.clear();
    this.injected.clear();
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
    this.touchLeft = false;
    this.touchRight = false;
    this.touchUp = false;
    this.touchDown = false;
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
    this.keys.clear();
    this.injected.clear();
  }

  setInjectedKeys(codes: string[]) {
    this.injected.clear();
    for (const code of codes) this.injected.add(code);
  }

  private down(...codes: string[]) {
    for (const code of codes) {
      if (this.keys.has(code) || this.injected.has(code)) return true;
    }
    return false;
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

    const left = this.down("ArrowLeft", "KeyA") || this.touchLeft;
    const right = this.down("ArrowRight", "KeyD") || this.touchRight;
    const up = this.down("ArrowUp", "KeyW") || this.touchUp || this.touchJump;
    const down = this.down("ArrowDown", "KeyS") || this.touchDown;

    let moveX = 0;
    if (left) moveX -= 1;
    if (right) moveX += 1;
    if (moveX === 0 && Math.abs(this.touchMoveX) > 0.2) moveX = this.touchMoveX;
    moveX = clamp(moveX, -1, 1);

    const jump = this.down("Space", "ArrowUp", "KeyW") || this.touchJump;
    const light = this.down("KeyJ", "KeyZ") || this.touchAttack;
    const heavy = this.down("KeyK", "KeyX") || this.touchHeavy;
    const kick = this.down("KeyL", "KeyC") || this.touchKick;

    const special1 = this.down("Digit1", "KeyU") || this.touchSpecial;
    const special2 = this.down("Digit2", "KeyI") || this.touchSpecial2;
    const special3 = this.down("Digit3", "KeyO") || this.touchSpecial3;
    const finisher = this.down("Digit4", "KeyP") || this.touchFinisher;

    const guard = this.down("KeyS", "ShiftLeft", "ShiftRight", "KeyG") || this.touchGuard;
    const parry = this.down("KeyF") || this.touchParry;
    const dash = this.down("KeyE") || this.touchDash;
    const pause = this.down("Escape");

    const specialSlotHeld = [
      this.down("Digit1", "KeyU") || this.touchSpecial,
      this.down("Digit2", "KeyI") || this.touchSpecial2,
      this.down("Digit3", "KeyO") || this.touchSpecial3,
      this.down("Digit4", "KeyP") || this.touchFinisher,
    ];
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
    this.last = actions;
    return actions;
  }

  snapshot() {
    return this.last;
  }
}

export const inputManager = new InputManagerImpl();
