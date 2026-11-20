export type RawInputState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  light: boolean;
  heavy: boolean;
  kick: boolean;
  special1: boolean;
  special2: boolean;
  special3: boolean;
  finisher: boolean;
  guard: boolean;
  parry: boolean;
  dash: boolean;
};

export type BufferedCommand =
  | "LIGHT"
  | "HEAVY"
  | "KICK"
  | "SPECIAL1"
  | "SPECIAL2"
  | "SPECIAL3"
  | "FINISHER"
  | "PARRY"
  | "DASH_FWD"
  | "DASH_BACK";

const COMMAND_WINDOW = 10 / 60;
const DOUBLE_TAP_WINDOW = 14 / 60;

type BufferEntry = {
  command: BufferedCommand;
  createdAt: number;
};

export class InputBuffer {
  private bufferQueue: BufferEntry[] = [];
  private time = 0;

  private prevRaw: RawInputState = {
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

  private lastLeftTap = -Infinity;
  private lastRightTap = -Infinity;

  push(raw: RawInputState, facing: number, dt: number) {
    this.time += dt;
    while (this.bufferQueue.length && this.time - this.bufferQueue[0].createdAt > COMMAND_WINDOW) {
      this.bufferQueue.shift();
    }

    // Edge triggers (just pressed)
    const justLight = raw.light && !this.prevRaw.light;
    const justHeavy = raw.heavy && !this.prevRaw.heavy;
    const justKick = raw.kick && !this.prevRaw.kick;
    const justSpec1 = raw.special1 && !this.prevRaw.special1;
    const justSpec2 = raw.special2 && !this.prevRaw.special2;
    const justSpec3 = raw.special3 && !this.prevRaw.special3;
    const justFinisher = raw.finisher && !this.prevRaw.finisher;
    const justParry =
      (raw.parry && !this.prevRaw.parry) ||
      (raw.guard && justLight);
    const justDash = raw.dash && !this.prevRaw.dash;
    const justLeft = raw.left && !raw.right && !this.prevRaw.left;
    const justRight = raw.right && !raw.left && !this.prevRaw.right;
    const doubleLeft = justLeft && this.time - this.lastLeftTap <= DOUBLE_TAP_WINDOW;
    const doubleRight = justRight && this.time - this.lastRightTap <= DOUBLE_TAP_WINDOW;
    if (justLeft) this.lastLeftTap = doubleLeft ? -Infinity : this.time;
    if (justRight) this.lastRightTap = doubleRight ? -Infinity : this.time;

    if (justDash || doubleLeft || doubleRight) {
      const movingBack = facing > 0 ? raw.left && !raw.right : raw.right && !raw.left;
      this.addCommand(movingBack ? "DASH_BACK" : "DASH_FWD");
    }

    // Priority insertion (Finisher > Specials > Parry > Heavies > Lights)
    if (justFinisher) this.addCommand("FINISHER");
    if (justSpec3) this.addCommand("SPECIAL3");
    if (justSpec2) this.addCommand("SPECIAL2");
    if (justSpec1) this.addCommand("SPECIAL1");
    if (justParry) this.addCommand("PARRY");
    if (justKick) this.addCommand("KICK");
    if (justHeavy) this.addCommand("HEAVY");
    if (justLight && !justParry) this.addCommand("LIGHT");

    this.prevRaw = { ...raw };
  }

  private addCommand(command: BufferedCommand) {
    this.bufferQueue.push({ command, createdAt: this.time });
  }

  take(canExecute: (command: BufferedCommand) => boolean): BufferedCommand | null {
    const index = this.bufferQueue.findIndex((entry) => canExecute(entry.command));
    if (index === -1) return null;
    return this.bufferQueue.splice(index, 1)[0].command;
  }

  clear() {
    this.bufferQueue.length = 0;
    this.lastLeftTap = -Infinity;
    this.lastRightTap = -Infinity;
  }
}
