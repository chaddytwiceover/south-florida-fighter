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
  "Digit1",
  "Digit2",
  "Digit3",
  "Escape",
  "Enter",
]);

export type GameActions = {
  moveX: number;
  jump: boolean;
  jumpPressed: boolean;
  attack: boolean;
  attackPressed: boolean;
  special: boolean;
  specialPressed: boolean;
  specialSlot: number | null;
  pausePressed: boolean;
};

const EMPTY: GameActions = {
  moveX: 0,
  jump: false,
  jumpPressed: false,
  attack: false,
  attackPressed: false,
  special: false,
  specialPressed: false,
  specialSlot: null,
  pausePressed: false,
};

function radialDeadzone(x: number, y: number, dz = 0.18) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

class InputManagerImpl {
  enabled = false;

  readonly keys = new Set<string>();
  readonly injected = new Set<string>();

  touchLeft = false;
  touchRight = false;
  touchMoveX = 0;
  touchJump = false;
  touchAttack = false;
  touchSpecial = false;

  private prevJump = false;
  private prevAttack = false;
  private prevSpecial = false;
  private prevPause = false;
  private prevSlot = [false, false, false];
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
    this.touchJump = false;
    this.touchAttack = false;
    this.touchSpecial = false;
    this.prevJump = true;
    this.prevAttack = true;
    this.prevSpecial = true;
    this.prevPause = true;
    this.prevSlot = [true, true, true];
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

  private readGamepad() {
    if (typeof navigator === "undefined" || !navigator.getGamepads) {
      return { x: 0, jump: false, attack: false, special: false };
    }
    const pads = navigator.getGamepads();
    for (const pad of pads) {
      if (!pad || pad.mapping !== "standard") continue;
      const stick = radialDeadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
      const dpadX = (pad.buttons[15]?.pressed ? 1 : 0) - (pad.buttons[14]?.pressed ? 1 : 0);
      return {
        x: clamp(stick.x + dpadX, -1, 1),
        jump: Boolean(pad.buttons[0]?.pressed),
        attack: Boolean(pad.buttons[2]?.pressed),
        special: Boolean(pad.buttons[3]?.pressed || pad.buttons[1]?.pressed),
      };
    }
    return { x: 0, jump: false, attack: false, special: false };
  }

  poll(): GameActions {
    if (!this.enabled) {
      this.prevJump = false;
      this.prevAttack = false;
      this.prevSpecial = false;
      this.prevPause = false;
      this.prevSlot = [false, false, false];
      this.last = EMPTY;
      return EMPTY;
    }

    const pad = this.readGamepad();
    const left = this.down("ArrowLeft", "KeyA") || this.touchLeft;
    const right = this.down("ArrowRight", "KeyD") || this.touchRight;

    let moveX = 0;
    if (left) moveX -= 1;
    if (right) moveX += 1;
    if (moveX === 0 && Math.abs(this.touchMoveX) > 0.2) moveX = this.touchMoveX;
    if (moveX === 0) moveX = pad.x;
    moveX = clamp(moveX, -1, 1);

    const jump =
      this.down("Space", "ArrowUp", "KeyW") || this.touchJump || pad.jump;
    const attack = this.down("KeyJ") || this.touchAttack || pad.attack;
    const special = this.down("KeyK") || this.touchSpecial || pad.special;
    const pause = this.down("Escape");

    const slotHeld = [
      this.down("Digit1"),
      this.down("Digit2"),
      this.down("Digit3"),
    ];
    let specialSlot: number | null = null;
    for (let i = 0; i < 3; i += 1) {
      if (slotHeld[i] && !this.prevSlot[i]) specialSlot = i;
    }

    const actions: GameActions = {
      moveX,
      jump,
      jumpPressed: jump && !this.prevJump,
      attack,
      attackPressed: attack && !this.prevAttack,
      special,
      specialPressed: special && !this.prevSpecial,
      specialSlot,
      pausePressed: pause && !this.prevPause,
    };

    this.prevJump = jump;
    this.prevAttack = attack;
    this.prevSpecial = special;
    this.prevPause = pause;
    this.prevSlot = slotHeld;
    this.last = actions;
    return actions;
  }

  snapshot() {
    return this.last;
  }
}

export const inputManager = new InputManagerImpl();
