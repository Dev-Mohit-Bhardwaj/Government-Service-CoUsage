/**
 * Project KRATOS Procedural Web Audio Sound Engine
 * Zero external audio files, zero latency, pure synthetic audio.
 * Generates tactile clicks, atmospheric hums, energy sweeps, and discovery chimes.
 */

class SoundService {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('kratos_muted') === 'true';
    this.initContext();
  }

  initContext() {
    // Lazily create AudioContext on first user interaction to comply with browser autoplay policies
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx && !this.ctx) {
      try {
        this.ctx = new AudioCtx();
      } catch (e) {
        console.warn('Web Audio API not supported', e);
      }
    }
  }

  resumeIfNeeded() {
    if (!this.ctx) this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('kratos_muted', String(this.isMuted));
    if (!this.isMuted) {
      this.playClick();
    }
    return this.isMuted;
  }

  /**
   * Subtle, high-frequency tactile micro-click on hover
   */
  playHover() {
    if (this.isMuted) return;
    this.resumeIfNeeded();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.035);

      gain.gain.setValueAtTime(0.018, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignore audio glitches
    }
  }

  /**
   * Confident mechanical micro-click on button press
   */
  playClick() {
    if (this.isMuted) return;
    this.resumeIfNeeded();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore audio glitches
    }
  }

  /**
   * Soft, air-cushion whoosh on page transitions
   */
  playTransition() {
    if (this.isMuted) return;
    this.resumeIfNeeded();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignore audio glitches
    }
  }

  /**
   * Cinematic ambient swell when landing page awakens
   */
  playAwakening() {
    if (this.isMuted) return;
    this.resumeIfNeeded();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Dual oscillator chord (sub-bass + fifth)
      [110, 164.81].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 0.9);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 2.5);
      });
    } catch {
      // Ignore audio glitches
    }
  }

  /**
   * Energy power-up sweep when clicking "EXPLORE KRATOS"
   */
  playExploreSweep() {
    if (this.isMuted) return;
    this.resumeIfNeeded();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.45);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // Ignore audio glitches
    }
  }

  /**
   * Rapid high-tech telemetry pulse while scanning association rules
   */
  playScanTick() {
    if (this.isMuted) return;
    this.resumeIfNeeded();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'square';
      osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Ignore audio glitches
    }
  }

  /**
   * Harmonic musical chime when recommendation cards materialize
   */
  playChime(noteIndex = 0) {
    if (this.isMuted) return;
    this.resumeIfNeeded();
    if (!this.ctx) return;

    // Pentatonic scale frequencies in Hz (C Major Pentatonic)
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const freq = notes[noteIndex % notes.length];

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Ignore audio glitches
    }
  }
}

export const sound = new SoundService();
