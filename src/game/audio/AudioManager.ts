/** Tiny placeholder SFX. Swap for real assets later. */

class AudioManagerImpl {
  private ctx: AudioContext | null = null;
  muted = false;

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
    }
    void this.ctx.resume();
  }

  private beep(freq: number, duration: number, type: OscillatorType, gain = 0.05) {
    if (this.muted || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(amp);
    amp.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  }

  jump() {
    this.beep(420, 0.09, "square", 0.04);
  }

  land() {
    this.beep(140, 0.07, "triangle", 0.035);
  }

  attack() {
    this.beep(210, 0.07, "square", 0.045);
  }

  special() {
    this.beep(540, 0.12, "sawtooth", 0.03);
  }

  whoosh() {
    this.beep(180, 0.1, "triangle", 0.04);
  }

  finisher() {
    this.beep(90, 0.18, "sawtooth", 0.05);
    this.beep(360, 0.14, "square", 0.03);
  }

  hurt() {
    this.beep(110, 0.12, "sawtooth", 0.05);
  }

  defeat() {
    this.beep(70, 0.16, "triangle", 0.05);
    this.beep(180, 0.1, "square", 0.03);
  }
}

export const audioManager = new AudioManagerImpl();
