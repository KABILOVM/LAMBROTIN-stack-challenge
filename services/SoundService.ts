
class SoundService {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
      // Пытаемся инициализировать контекст заранее
      if (typeof window !== 'undefined') {
          const events = ['touchstart', 'click', 'keydown'];
          const unlock = () => {
              this.init();
              events.forEach(e => window.removeEventListener(e, unlock));
          };
          events.forEach(e => window.addEventListener(e, unlock));
      }
  }

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
    if (!this.ctx || this.ctx.state !== 'running') return;

    const startTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  playLanding(combo: number) {
    const baseFreq = 440 * Math.pow(2, (combo % 12) / 12);
    this.playTone(baseFreq, 'triangle', 0.2, 0.15); // Сокращена длительность для четкости
  }

  playPerfect() {
    this.playTone(880, 'sine', 0.4, 0.2);
    this.playTone(1320, 'sine', 0.3, 0.1);
  }

  playGameOver() {
    this.playTone(220, 'sawtooth', 0.5, 0.1);
  }

  playStart() {
    this.playTone(523.25, 'sine', 0.3, 0.15);
  }
}

export const sounds = new SoundService();
