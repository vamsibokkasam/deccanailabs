let currentUtterance = null;
let speakSession = 0;

const REJECT_VOICE = /male|david|mark|daniel|fred|alex|tom|george|ravi|barry|bruce|deep|robot|whisper|david desktop/i;

const PREFERRED_VOICES = [
  /kathy|ivy|princess|child|kid|girl/i,
  /samantha/i,
  /zira/i,
  /hazel/i,
  /heera/i,
  /priya/i,
  /veena/i,
  /karen/i,
  /victoria/i,
  /aria/i,
  /jenny/i,
  /google uk english female/i,
  /female/i,
];

/** Little kid talking — higher pitch, slower, not a young adult. */
export const DECCO_VOICE = {
  rate: 0.86,
  pitch: 1.62,
  volume: 0.92,
};

/** Warm kid-style hello if intro is used. */
export const DECCO_INTRO_LINES = [
  { text: "Hi guys, I'm Decco, from Deccan AI Labs.", pitch: 1.68, rate: 0.84, pauseAfter: 0 },
];

export const DECCO_INTRO_TEXT = "Hi guys! I'm Decco. From Deccan AI Labs.";

function pickVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const english = voices.filter(
    (v) => /^(en|hi)/i.test(v.lang) && !REJECT_VOICE.test(v.name)
  );
  const pool = english.length ? english : voices.filter((v) => !REJECT_VOICE.test(v.name));
  if (!pool.length) return voices[0];

  const local = pool.filter((v) => v.localService);
  const search = local.length ? local : pool;

  for (const pattern of PREFERRED_VOICES) {
    const match = search.find((v) => pattern.test(v.name));
    if (match) return match;
  }

  return search[0];
}

/** Speak like a child — natural pauses, no robotic spelling. */
export function toCuteSpeech(text) {
  return String(text || "")
    .replace(/ — /g, ", ")
    .replace(/ – /g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function waitForVoices() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    if (window.speechSynthesis.getVoices().length) {
      resolve();
      return;
    }
    const onVoices = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve();
    }, 400);
  });
}

/**
 * Estimate how long TTS will take (ms). Used to pace mouth animation.
 */
export function estimateSpeechDurationMs(text, rate = DECCO_VOICE.rate) {
  const clean = String(text || "").trim();
  if (!clean) return 800;
  const words = clean.split(/\s+/).filter(Boolean).length;
  const chars = clean.replace(/\s/g, "").length;
  const byWords = (words / 2.2) * 1000;
  const byChars = (chars / 12) * 1000;
  const raw = Math.max(byWords, byChars) * 1.08;
  return Math.max(850, Math.round(raw / Math.max(rate, 0.5)));
}

/**
 * Map spoken text → mouth openness sequence (0–3) for lip-sync pacing.
 */
export function buildMouthTimeline(text, durationMs) {
  const chars = [...String(text || "")];
  if (!chars.length) {
    return [{ at: 0, mouth: 0 }];
  }

  const steps = [];
  for (const ch of chars) {
    const c = ch.toLowerCase();
    if (/\s/.test(c) || /[.,!?;:]/.test(c)) {
      steps.push(0);
    } else if ("aeiou".includes(c)) {
      steps.push(3);
    } else if ("wy".includes(c)) {
      steps.push(2);
    } else if ("mbfp".includes(c)) {
      steps.push(0);
    } else {
      steps.push(1);
    }
  }

  const collapsed = [];
  for (const m of steps) {
    const prev = collapsed[collapsed.length - 1];
    if (prev === m && m === 0) continue;
    collapsed.push(m);
  }

  const n = Math.max(collapsed.length, 1);
  const stepMs = durationMs / n;
  return collapsed.map((mouth, i) => ({
    at: Math.round(i * stepMs),
    mouth,
  }));
}

function speakUtterance(text, profile, hooks) {
  const utterance = new SpeechSynthesisUtterance(toCuteSpeech(text));
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || "en-US";
  utterance.rate = Math.min(2, Math.max(0.5, profile.rate ?? DECCO_VOICE.rate));
  utterance.pitch = Math.min(2, Math.max(0.5, profile.pitch ?? DECCO_VOICE.pitch));
  utterance.volume = profile.volume ?? DECCO_VOICE.volume;

  utterance.onstart = () => hooks.onStart?.();
  utterance.onend = () => {
    currentUtterance = null;
    hooks.onEnd?.();
  };
  utterance.onerror = (event) => {
    currentUtterance = null;
    if (event?.error === "interrupted" || event?.error === "canceled") {
      hooks.onEnd?.();
      return;
    }
    hooks.onError?.(event);
  };
  utterance.onboundary = (event) => hooks.onBoundary?.(event);

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/**
 * Speak text in Decco's little-kid voice.
 *
 * @param {string} text
 * @param {{
 *   pitch?: number,
 *   rate?: number,
 *   volume?: number,
 *   onStart?: () => void,
 *   onEnd?: () => void,
 *   onError?: (err: unknown) => void,
 *   onBoundary?: (event: SpeechSynthesisEvent) => void,
 * }} [hooks]
 * @returns {() => void} cancel function
 */
export function speakDecco(text, hooks = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    hooks.onError?.(new Error("Speech synthesis unavailable"));
    hooks.onEnd?.();
    return () => {};
  }

  const session = ++speakSession;
  window.speechSynthesis.cancel();
  currentUtterance = null;

  const profile = {
    pitch: hooks.pitch ?? DECCO_VOICE.pitch,
    rate: hooks.rate ?? DECCO_VOICE.rate,
    volume: hooks.volume ?? DECCO_VOICE.volume,
  };

  waitForVoices().then(() => {
    if (session !== speakSession) return;
    speakUtterance(text, profile, hooks);
  });

  return () => {
    speakSession += 1;
    window.speechSynthesis.cancel();
    currentUtterance = null;
  };
}

/**
 * Speak several short lines with playful pauses and pitch lifts.
 *
 * @param {{ text: string, pitch?: number, rate?: number }[]} lines
 * @param {{
 *   onStart?: () => void,
 *   onEnd?: () => void,
 *   onError?: (err: unknown) => void,
 *   onBoundary?: (event: SpeechSynthesisEvent) => void,
 * }} [hooks]
 * @returns {() => void}
 */
export function speakDeccoIntro(lines = DECCO_INTRO_LINES, hooks = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    hooks.onError?.(new Error("Speech synthesis unavailable"));
    hooks.onEnd?.();
    return () => {};
  }

  const session = ++speakSession;
  window.speechSynthesis.cancel();
  currentUtterance = null;

  const queue = lines.filter((line) => line?.text);
  let started = false;
  let index = 0;

  const next = () => {
    if (session !== speakSession) return;
    if (index >= queue.length) {
      hooks.onEnd?.();
      return;
    }

    const line = queue[index];
    index += 1;

    speakUtterance(line.text, {
      pitch: line.pitch ?? DECCO_VOICE.pitch,
      rate: line.rate ?? DECCO_VOICE.rate,
      volume: DECCO_VOICE.volume,
    }, {
      onStart: () => {
        if (!started) {
          started = true;
          hooks.onStart?.();
        }
      },
      onBoundary: hooks.onBoundary,
      onEnd: () => {
        if (session !== speakSession) return;
        window.setTimeout(next, line.pauseAfter ?? 320);
      },
      onError: (err) => {
        if (session !== speakSession) return;
        hooks.onError?.(err);
      },
    });
  };

  waitForVoices().then(() => {
    if (session !== speakSession) return;
    next();
  });

  return () => {
    speakSession += 1;
    window.speechSynthesis.cancel();
    currentUtterance = null;
  };
}

export function cancelDeccoSpeech() {
  speakSession += 1;
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}
