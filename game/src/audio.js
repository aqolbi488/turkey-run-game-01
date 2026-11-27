// Tiny WebAudio sound kit: every noise is synthesized, no audio files.
// Browsers only allow sound after a user gesture, so the context is created
// lazily on the first key or click and stays silent (never an error) before.

export function createAudio() {
  let context = null;
  let master = null;

  function ensure() {
    if (context) return true;
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return false;
      context = new AudioCtor();
      master = context.createGain();
      master.gain.value = 0.16;
      master.connect(context.destination);
      return true;
    } catch {
      return false;
    }
  }

  function tone(freqStart, freqEnd, seconds, type, volume, delay = 0) {
    if (!ensure()) return;
    const start = context.currentTime + delay;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqEnd), start + seconds);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + seconds + 0.02);
  }

  return {
    unlock() { ensure(); if (context && context.state === 'suspended') context.resume(); },
    gobble() { tone(520, 180, 0.16, 'square', 0.5); tone(640, 220, 0.14, 'square', 0.4, 0.09); },
    corn() { tone(880, 1320, 0.1, 'sine', 0.6); },
    hurt() { tone(300, 90, 0.25, 'sawtooth', 0.6); },
    spotted() { tone(740, 740, 0.09, 'square', 0.5); tone(740, 740, 0.09, 'square', 0.5, 0.13); },
    knife() { tone(1800, 500, 0.12, 'triangle', 0.35); },
    oven() { tone(160, 60, 0.3, 'sawtooth', 0.45); },
    dash() { tone(400, 900, 0.14, 'sine', 0.4); },
    stage() { [523, 659, 784].forEach((f, i) => tone(f, f, 0.16, 'triangle', 0.5, i * 0.1)); },
    caught() { tone(400, 60, 0.7, 'sawtooth', 0.6); },
    escaped() { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.22, 'triangle', 0.55, i * 0.12)); },
  };
}
