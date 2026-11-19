/**
 * Sesler Web Audio ile üretilir (dosya yok, lisans gerekmez): yumuşak cam tınısı, dökme,
 * mühür çanı, bölüm sonu melodisi, keşif parıltısı ve isteğe bağlı hafif müzik.
 */

type Sfx = 'tap' | 'pour' | 'seal' | 'win' | 'discover' | 'reveal' | 'mix' | 'soft';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;
  sfxOn = true;
  musicOn = false;
  volume = 0.6;

  private ensure(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    }
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      this.ctx = new AC();
    } catch {
      return null;
    }
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume * 0.5;
    this.master.connect(this.ctx.destination);
    return this.ctx;
  }

  configure(opts: { sfx: boolean; music: boolean; volume: number }): void {
    this.sfxOn = opts.sfx;
    this.volume = opts.volume;
    if (this.master) this.master.gain.value = this.volume * 0.5;
    if (opts.music !== this.musicOn) {
      this.musicOn = opts.music;
      if (opts.music) this.startMusic();
      else this.stopMusic();
    }
  }

  /** Tarayıcılar sesi ilk dokunuştan sonra açar. */
  unlock(): void {
    this.ensure();
    if (this.musicOn && this.musicTimer === null) this.startMusic();
  }

  private tone(
    freq: number,
    start: number,
    dur: number,
    gain: number,
    type: OscillatorType = 'sine',
    dest?: AudioNode,
  ): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(dest ?? this.master!);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  /** Cam tınısı: temel + uyumsuz kısmi tonlar (çan benzeri). */
  private glass(freq: number, start: number, gain: number, dur = 1.2): void {
    this.tone(freq, start, dur, gain);
    this.tone(freq * 2.76, start, dur * 0.5, gain * 0.28);
    this.tone(freq * 5.4, start, dur * 0.25, gain * 0.12);
  }

  play(kind: Sfx): void {
    if (!this.sfxOn) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime + 0.01;
    switch (kind) {
      case 'tap':
        this.glass(1320, t, 0.12, 0.35);
        break;
      case 'soft':
        this.tone(660, t, 0.18, 0.08);
        break;
      case 'pour': {
        // Süzgeçten geçen gürültü: akan sıvı.
        const len = 0.5;
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.Q.value = 3;
        bp.frequency.setValueAtTime(500, t);
        bp.frequency.linearRampToValueAtTime(1300, t + len);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.22, t + 0.06);
        g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        src.connect(bp);
        bp.connect(g);
        g.connect(this.master);
        src.start(t + 0.18);
        break;
      }
      case 'reveal':
        this.glass(1046, t, 0.08, 0.5);
        this.glass(1568, t + 0.08, 0.06, 0.5);
        break;
      case 'mix':
        this.glass(784, t, 0.09, 0.6);
        this.glass(988, t + 0.06, 0.08, 0.6);
        break;
      case 'seal':
        this.glass(880, t, 0.2, 1.4);
        this.glass(1318.5, t + 0.09, 0.14, 1.2);
        break;
      case 'win': {
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        notes.forEach((f, i) => this.glass(f, t + i * 0.13, 0.16, 1.6));
        break;
      }
      case 'discover': {
        const notes = [698.46, 880, 1046.5, 1396.9, 1760];
        notes.forEach((f, i) => this.glass(f, t + i * 0.07, 0.1, 1.4));
        break;
      }
    }
  }

  private startMusic(): void {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.musicTimer !== null) return;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0.35;
    this.musicGain.connect(this.master);
    // Yavaş, sakin arpej (D dorian). Her 8 sn'de bir dizi planlanır.
    const chords = [
      [146.83, 220, 293.66, 349.23],
      [130.81, 196, 261.63, 329.63],
      [116.54, 174.61, 233.08, 293.66],
      [130.81, 196, 246.94, 329.63],
    ];
    let step = 0;
    const schedule = () => {
      if (!this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime + 0.05;
      const chord = chords[step % chords.length]!;
      chord.forEach((f, i) => {
        this.tone(f, now + i * 0.9, 3.6, 0.05, 'triangle', this.musicGain!);
        this.tone(f * 2, now + 2 + i * 0.9, 2.4, 0.025, 'sine', this.musicGain!);
      });
      step++;
    };
    schedule();
    this.musicTimer = window.setInterval(schedule, 7200);
  }

  private stopMusic(): void {
    if (this.musicTimer !== null) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
    if (this.musicGain) {
      try {
        this.musicGain.disconnect();
      } catch {
        /* yok say */
      }
    }
    this.musicGain = null;
  }
}

export const sound = new SoundEngine();
