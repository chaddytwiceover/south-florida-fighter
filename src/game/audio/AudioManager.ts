/**
 * Modern 2D Fighter WebAudio DSP Sound Engine
 * Rich procedural synthesizer for punchy 808 impacts, sword/chain whooshes,
 * metal parry clangs, combo chimes, and match events.
 */

class AudioManagerImpl {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  muted = false;
  volume = 0.8;

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.setVolume(this.volume);
    return this.muted;
  }

  // Synth noise generator for impact texture
  private playNoise(duration: number, bandFreq: number, gainVal: number) {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(bandFreq, t);
    filter.Q.setValueAtTime(3, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(t);
  }

  jump() {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.12);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  land() {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  dash() {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    this.playNoise(0.14, 800, 0.08);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.14);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  swing(speed = 1) {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    const dur = 0.08 / speed;
    this.playNoise(dur, 1200 * speed, 0.05);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320 * speed, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + dur);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  hitLight() {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    this.playNoise(0.06, 2400, 0.08);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  hitHeavy() {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    // 808 Sub-bass kick + noise crack
    this.playNoise(0.12, 1800, 0.12);
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(140, t);
    sub.frequency.exponentialRampToValueAtTime(35, t + 0.22);
    subGain.gain.setValueAtTime(0.18, t);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(t);
    sub.stop(t + 0.22);
  }

  block() {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.09);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  parry() {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    // Metallic resonant chime
    const freqs = [880, 1320, 1760, 2640];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      const amp = 0.08 / (idx + 1);
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  special() {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    this.playNoise(0.2, 3200, 0.08);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(680, t + 0.18);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  finisher() {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    this.playNoise(0.35, 1200, 0.2);
    // Massive 808 sub-drop
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = "sawtooth";
    sub.frequency.setValueAtTime(160, t);
    sub.frequency.exponentialRampToValueAtTime(28, t + 0.45);
    subGain.gain.setValueAtTime(0.22, t);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(t);
    sub.stop(t + 0.45);
  }

  comboChime(comboCount: number) {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    const baseFreq = 440 * Math.pow(1.06, Math.min(18, comboCount));
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, t);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  roundAnnounce() {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    [320, 480, 640].forEach((freq, i) => {
      const startT = t + i * 0.12;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, startT);
      gain.gain.setValueAtTime(0.08, startT);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startT);
      osc.stop(startT + 0.15);
    });
  }

  koAnnounce() {
    if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    [640, 480, 240, 110].forEach((freq, i) => {
      const startT = t + i * 0.14;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, startT);
      gain.gain.setValueAtTime(0.1, startT);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startT);
      osc.stop(startT + 0.2);
    });
  }

  hurt() {
    this.hitLight();
  }

  attack() {
    this.swing();
  }

  whoosh() {
    this.dash();
  }

  defeat() {
    this.koAnnounce();
  }
}

export const audioManager = new AudioManagerImpl();
