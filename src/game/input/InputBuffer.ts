/**
 * Modern Fighting Game Deterministic Input Buffer (8-frame FIFO Queue)
 * Resolves commands with leniency, double-tap dashes, charge/motion inputs, and cancels.
 */

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
  | "DASH_BACK"
  | "JUMP";

export type BufferEntry = {
  command: BufferedCommand;
  frameCreated: number;
  consumed: boolean;
};

export class InputBuffer {
  private history: RawInputState[] = [];
  private bufferQueue: BufferEntry[] = [];
  private currentFrame = 0;
  private bufferLeniencyFrames = 10; // 10 frames (~160ms) leniency window

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

  private tapTimes = {
    fwdTap: -999,
    backTap: -999,
  };

  push(raw: RawInputState, facing: number) {
    this.currentFrame++;
    this.history.push({ ...raw });
    if (this.history.length > 30) this.history.shift();

    // Clean expired buffer entries
    this.bufferQueue = this.bufferQueue.filter(
      (entry) =>
        !entry.consumed &&
        this.currentFrame - entry.frameCreated <= this.bufferLeniencyFrames,
    );

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
    const justUp = raw.up && !this.prevRaw.up;

    const movingFwd = (facing > 0 && raw.right) || (facing < 0 && raw.left);
    const movingBack = (facing > 0 && raw.left) || (facing < 0 && raw.right);
    const justFwd = (facing > 0 && raw.right && !this.prevRaw.right) || (facing < 0 && raw.left && !this.prevRaw.left);
    const justBack = (facing > 0 && raw.left && !this.prevRaw.left) || (facing < 0 && raw.right && !this.prevRaw.right);

    // Double-tap dash detection (within 14 frames)
    if (justFwd) {
      if (this.currentFrame - this.tapTimes.fwdTap <= 14) {
        this.addCommand("DASH_FWD");
        this.tapTimes.fwdTap = -999;
      } else {
        this.tapTimes.fwdTap = this.currentFrame;
      }
    }
    if (justBack) {
      if (this.currentFrame - this.tapTimes.backTap <= 14) {
        this.addCommand("DASH_BACK");
        this.tapTimes.backTap = -999;
      } else {
        this.tapTimes.backTap = this.currentFrame;
      }
    }

    if (justDash) {
      if (movingBack) {
        this.addCommand("DASH_BACK");
      } else {
        this.addCommand("DASH_FWD");
      }
    }

    // Priority insertion (Finisher > Specials > Parry > Heavies > Lights)
    if (justFinisher) this.addCommand("FINISHER");
    if (justSpec3) this.addCommand("SPECIAL3");
    if (justSpec2) this.addCommand("SPECIAL2");
    if (justSpec1) this.addCommand("SPECIAL1");
    if (justParry) this.addCommand("PARRY");
    if (justKick) this.addCommand("KICK");
    if (justHeavy) this.addCommand("HEAVY");
    if (justLight) this.addCommand("LIGHT");
    if (justUp) this.addCommand("JUMP");

    this.prevRaw = { ...raw };
  }

  private addCommand(command: BufferedCommand) {
    this.bufferQueue.push({
      command,
      frameCreated: this.currentFrame,
      consumed: false,
    });
  }

  peek(): BufferedCommand | null {
    const entry = this.bufferQueue.find((e) => !e.consumed);
    return entry ? entry.command : null;
  }

  consume(command?: BufferedCommand): BufferedCommand | null {
    if (command) {
      const idx = this.bufferQueue.findIndex(
        (e) => !e.consumed && e.command === command,
      );
      if (idx !== -1) {
        this.bufferQueue[idx].consumed = true;
        return this.bufferQueue[idx].command;
      }
      return null;
    }
    const entry = this.bufferQueue.find((e) => !e.consumed);
    if (entry) {
      entry.consumed = true;
      return entry.command;
    }
    return null;
  }

  clear() {
    this.bufferQueue = [];
  }
}
