// Narration (the browser's built-in text-to-speech) plus short synthesized sound cues. No audio files needed.
import { useSyncExternalStore } from 'react';

const MUTE_KEY = 'takxila_muted';
let ctx: AudioContext | null = null;
let unlocked = false;
let muted = (() => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
})();

// ---- tiny external store so React controls can follow narration state ----
interface Snap {
  muted: boolean;
  speaking: boolean;
  playable: boolean;
}
let snap: Snap = { muted, speaking: false, playable: false };
const subs = new Set<() => void>();
const publish = () => {
  snap = { muted, speaking: speaking, playable: !!lastText };
  subs.forEach((f) => f());
};
export const useNarration = () =>
  useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => snap,
  );

let speaking = false;
let lastText = '';
let lastLang = 'en';
let offset = 0;
let keepAlive: SpeechSynthesisUtterance | null = null; // some browsers drop an utterance nobody references
let onUnavailable: ((lang: string) => void) | null = null;
const flagged: Record<string, boolean> = {};
const hasTTS = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function ensureCtx(): AudioContext | null {
  if (!ctx) {
    try {
      const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const Ctor = W.AudioContext ?? W.webkitAudioContext;
      ctx = Ctor ? new Ctor() : null;
    } catch {
      ctx = null;
    }
  }
  return ctx;
}

function tone(f0: number, f1: number, dur: number, type: OscillatorType, peak: number, delay: number) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function clap(count: number, span: number, peak: number) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime;
  for (let i = 0; i < count; i++) {
    const delay = Math.random() * span;
    const dur = 0.045 + Math.random() * 0.05;
    const size = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let j = 0; j < size; j++) data[j] = (Math.random() * 2 - 1) * (1 - j / size);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900 + Math.random() * 2500;
    bp.Q.value = 1;
    const g = ctx.createGain();
    g.gain.value = peak * (0.6 + Math.random() * 0.6);
    src.connect(bp);
    bp.connect(g);
    g.connect(ctx.destination);
    src.start(t0 + delay);
  }
}

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  if (!hasTTS()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (lang && lang !== 'en') {
    const target = lang.toLowerCase();
    return voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(target.split('-')[0])) ?? null;
  }
  return (
    voices.find((v) => /en[-_]in/i.test(v.lang) && /male/i.test(v.name)) ||
    voices.find((v) => /en[-_]in/i.test(v.lang)) ||
    voices.find((v) => /male/i.test(v.name) && /^en/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null
  );
}

const normalize = (t: string) => t.replace(/\bAI\b/g, 'A. I.');

function speakFrom(from: number) {
  if (muted || !hasTTS() || !lastText) return;
  window.speechSynthesis.cancel();
  const slice = lastText.slice(from);
  if (!slice.trim()) {
    speaking = false;
    publish();
    return;
  }
  const u = new SpeechSynthesisUtterance(slice);
  const voice = pickVoice(lastLang);
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  } else {
    u.lang = lastLang;
    if (lastLang !== 'en' && window.speechSynthesis.getVoices().length > 0 && !flagged[lastLang]) {
      flagged[lastLang] = true;
      onUnavailable?.(lastLang);
    }
  }
  u.rate = 1;
  u.onstart = () => {
    speaking = true;
    publish();
  };
  u.onboundary = (e) => {
    offset = from + (e.charIndex || 0);
  };
  u.onend = () => {
    offset = lastText.length;
    speaking = false;
    publish();
  };
  u.onerror = () => {
    speaking = false;
    publish();
  };
  keepAlive = u;
  window.speechSynthesis.speak(u);
}

function stopSpeech() {
  if (hasTTS()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
  speaking = false;
  publish();
}

export const Narrator = {
  /** Call from a click handler: browsers only allow sound after a user gesture. */
  unlock() {
    if (unlocked) return;
    unlocked = true;
    const c = ensureCtx();
    if (c && c.state === 'suspended') void c.resume().catch(() => undefined);
  },
  isMuted: () => muted,
  setMuted(v: boolean) {
    muted = v;
    try {
      localStorage.setItem(MUTE_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (v) stopSpeech();
    publish();
  },
  onUnavailable(fn: (lang: string) => void) {
    onUnavailable = fn;
  },
  /** Narrate a screen from the start. */
  play(text: string, lang = 'en') {
    stopSpeech();
    lastText = normalize(text);
    lastLang = lang;
    offset = 0;
    publish();
    if (!muted) speakFrom(0);
  },
  resume() {
    if (!lastText) return;
    speakFrom(offset >= lastText.length ? 0 : offset);
  },
  pause: stopSpeech,
  restart() {
    offset = 0;
    speakFrom(0);
  },
  stop() {
    stopSpeech();
  },
  /** Short spoken + synthesized cues. */
  say(text: string, lang = 'en') {
    if (muted || !hasTTS()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(lang);
    if (v) {
      u.voice = v;
      u.lang = v.lang;
    }
    keepAlive = u;
    window.speechSynthesis.speak(u);
  },
  correct(say = "That's correct! Great job.") {
    this.unlock();
    tone(523.25, 659.25, 0.13, 'sine', 0.22, 0);
    tone(659.25, 783.99, 0.17, 'sine', 0.22, 0.11);
    clap(16, 0.8, 0.16);
    this.say(say);
  },
  wrong(say = 'Wrong attempt. Retry.') {
    this.unlock();
    tone(320, 150, 0.3, 'sawtooth', 0.16, 0);
    this.say(say);
  },
  finale(say: string) {
    this.unlock();
    clap(85, 3.4, 0.14);
    window.setTimeout(() => clap(40, 1.6, 0.11), 1200);
    this.say(say);
  },
};

