class AudioController {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isSoundEnabled() {
    return this.enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number) {
    if (!this.enabled || !this.ctx) return;
    
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  }

  playEat() {
    this.playTone(800, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(1200, 'sine', 0.15, 0.1), 50);
  }

  playDie() {
    this.playTone(150, 'sawtooth', 0.4, 0.2);
    setTimeout(() => this.playTone(100, 'sawtooth', 0.4, 0.2), 100);
  }
  
  playMove() {
     // Very subtle tick for movement, optional
     // this.playTone(300, 'triangle', 0.05, 0.02);
  }
}

export const audio = new AudioController();