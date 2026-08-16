/**
 * Web Audio Engine for high-fidelity procedural beat preview and audio playback utilities.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlayingProcedural = false;
  private currentBeatId: string | null = null;
  private tempo = 120;
  private timerId: number | null = null;
  private step = 0;
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public playSynthTone(freq = 800, duration = 0.05, type: OscillatorType = 'sine') {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  public playKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);
    
    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + 0.25);
  }

  public playSnare(time: number, isTight = false) {
    if (!this.ctx || !this.masterGain) return;
    // Noise buffer
    const bufferSize = this.ctx.sampleRate * (isTight ? 0.1 : 0.2);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(800, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + (isTight ? 0.1 : 0.18));

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Tonal body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.08);

    oscGain.gain.setValueAtTime(0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    noise.start(time);
    osc.start(time);
    noise.stop(time + (isTight ? 0.12 : 0.2));
    osc.stop(time + 0.1);
  }

  public playHiHat(time: number, open = false) {
    if (!this.ctx || !this.masterGain) return;
    const dur = open ? 0.25 : 0.04;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(open ? 0.35 : 0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + dur);
  }

  public playBass(time: number, freq: number, dur = 0.3) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + dur);

    gain.gain.setValueAtTime(0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  public playChordPad(time: number, freqs: number[], dur = 1.2) {
    if (!this.ctx || !this.masterGain) return;
    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + dur);
    });
  }

  public startBeatPattern(beatId: string, bpm = 120, genre = 'trap', onStep?: (step: number) => void) {
    this.initContext();
    this.stopBeatPattern();
    this.isPlayingProcedural = true;
    this.currentBeatId = beatId;
    this.tempo = bpm || 120;
    this.step = 0;

    const stepInterval = (60 / this.tempo) / 4; // 16th notes
    let nextStepTime = this.ctx!.currentTime + 0.05;

    const chordProgressions: Record<string, number[][]> = {
      'dnb': [[185, 220, 277], [164, 196, 246], [146, 174, 220], [130, 164, 196]], // F#m, Em, Dm, C#m
      'trap': [[146, 174, 220], [138, 164, 207], [130, 155, 196], [123, 146, 185]], // Dm, C#m, Cm, Bm
      'lofi': [[261.6, 329.6, 392, 493.8], [220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [196, 246.9, 293.6, 349.2]], // Cmaj7, Am7, Fmaj7, G7
      'synthwave': [[220, 261.6, 329.6], [174.6, 220, 261.6], [130.8, 164.8, 196], [196, 246.9, 293.6]], // Am, F, C, G
      'boombap': [[196, 233, 293.6], [174.6, 207.6, 261.6], [164.8, 196, 246.9], [146.8, 174.6, 220]]
    };

    const bassNotes: Record<string, number[]> = {
      'dnb': [46.2, 46.2, 41.2, 36.7],
      'trap': [36.7, 36.7, 43.6, 32.7],
      'lofi': [65.4, 55.0, 43.6, 49.0],
      'synthwave': [55.0, 43.6, 32.7, 49.0],
      'boombap': [49.0, 43.6, 41.2, 36.7]
    };

    const gKey = genre.toLowerCase().includes('dnb') ? 'dnb' 
      : genre.toLowerCase().includes('lo') ? 'lofi' 
      : genre.toLowerCase().includes('synth') ? 'synthwave'
      : genre.toLowerCase().includes('boom') ? 'boombap'
      : 'trap';

    const chords = chordProgressions[gKey] || chordProgressions['trap'];
    const bass = bassNotes[gKey] || bassNotes['trap'];

    const scheduler = () => {
      if (!this.isPlayingProcedural || !this.ctx) return;

      while (nextStepTime < this.ctx.currentTime + 0.2) {
        const s = this.step % 16;
        const bar = Math.floor(this.step / 16) % 4;

        // Kick logic
        if (gKey === 'dnb') {
          if (s === 0 || s === 10) this.playKick(nextStepTime);
        } else if (gKey === 'trap') {
          if (s === 0 || s === 6 || s === 10 || s === 14) this.playKick(nextStepTime);
        } else if (gKey === 'synthwave') {
          if (s === 0 || s === 4 || s === 8 || s === 12) this.playKick(nextStepTime);
        } else {
          // Boom bap / Lofi
          if (s === 0 || s === 7 || s === 11) this.playKick(nextStepTime);
        }

        // Snare / Clap logic
        if (gKey === 'dnb') {
          if (s === 4 || s === 12) this.playSnare(nextStepTime, true);
        } else if (gKey === 'trap') {
          if (s === 8) this.playSnare(nextStepTime);
        } else if (gKey === 'synthwave') {
          if (s === 4 || s === 12) this.playSnare(nextStepTime);
        } else {
          if (s === 4 || s === 12) this.playSnare(nextStepTime);
        }

        // Hi-Hat logic
        if (gKey === 'trap') {
          // Trap rolls
          if (s % 2 === 0 || (s >= 12 && s <= 15)) {
            this.playHiHat(nextStepTime, false);
          }
        } else {
          if (s % 2 === 0) {
            this.playHiHat(nextStepTime, s === 14);
          }
        }

        // Bass logic
        if (s === 0 || s === 6) {
          this.playBass(nextStepTime, bass[bar], stepInterval * 3);
        }

        // Chords logic
        if (s === 0) {
          this.playChordPad(nextStepTime, chords[bar], stepInterval * 14);
        }

        if (onStep) {
          const currentS = s;
          setTimeout(() => onStep(currentS), Math.max(0, (nextStepTime - this.ctx!.currentTime) * 1000));
        }

        nextStepTime += stepInterval;
        this.step++;
      }

      this.timerId = window.setTimeout(scheduler, 50);
    };

    scheduler();
  }

  public stopBeatPattern() {
    this.isPlayingProcedural = false;
    this.currentBeatId = null;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public isCurrentlyPlayingProcedural(beatId?: string) {
    if (beatId) return this.isPlayingProcedural && this.currentBeatId === beatId;
    return this.isPlayingProcedural;
  }
}

export const audioEngine = new AudioEngine();
