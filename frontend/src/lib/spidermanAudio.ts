// Web Audio API Synthesizer for Spider-Man Interactive Login
// Generates clean, zero-latency procedural sound effects without external audio files

class SpiderManSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private volume: number = 0.4;

  constructor() {
    // Initialized lazily on first user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      this.initContext();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMuted(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Iconic Spider-Man "Thwip!" Web Shooting Sound
  public playWebShoot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // Fast downward frequency sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(this.volume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.17);
    } catch (e) {
      // Audio error ignored safely
    }
  }

  // Smooth Movement Whoosh Sound
  public playWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.12;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(900, now + 0.06);
      filter.frequency.exponentialRampToValueAtTime(250, now + 0.12);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
    } catch (e) {}
  }

  // Celebratory Login Success Chime (Pentatonic Major Chord)
  public playSuccessChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.75);
      });
    } catch (e) {}
  }

  // Soft Confused Error Tone
  public playErrorSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }
}

export const soundEngine = new SpiderManSoundEngine();
