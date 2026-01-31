
class SoundService {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(val: boolean) {
    this.muted = val;
  }

  isMuted() {
    return this.muted;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playLanding(combo: number) {
    // Base frequency increases with combo
    const baseFreq = 440 * Math.pow(2, (combo % 12) / 12);
    this.playTone(baseFreq, 'triangle', 0.5, 0.2);
    // Add a higher harmonic for a "crystal" feel
    this.playTone(baseFreq * 2, 'sine', 0.3, 0.1);
  }

  playPerfect() {
    this.playTone(880, 'sine', 0.6, 0.3);
    this.playTone(1320, 'sine', 0.4, 0.15);
  }

  playGameOver() {
    this.playTone(220, 'sawtooth', 0.8, 0.1);
    this.playTone(110, 'sine', 1.2, 0.2);
  }

  playStart() {
    this.playTone(523.25, 'sine', 0.5, 0.2); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.5, 0.15), 100); // E5
  }
}

export const sounds = new SoundService();
