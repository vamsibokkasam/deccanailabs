let currentUtterance = null;

function pickVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferred = voices.find(
    (v) =>
      /en(-|_)?(US|GB|IN)?/i.test(v.lang) &&
      /female|samantha|google uk english female|zira|aria|jenny/i.test(v.name)
  );
  const english =
    preferred ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    voices[0];
  return english;
}

/**
 * Estimate how long TTS will take (ms). Used to pace mouth animation.
 * Tuned for English at rate ≈ 1.
 */
export function estimateSpeechDurationMs(text, rate = 1) {
  const clean = String(text || "").trim();
  if (!clean) return 800;
  const words = clean.split(/\s+/).filter(Boolean).length;
  const chars = clean.replace(/\s/g, "").length;
  const byWords = (words / 2.35) * 1000;
  const byChars = (chars / 12.5) * 1000;
  const raw = Math.max(byWords, byChars) * 1.06;
  return Math.max(850, Math.round(raw / Math.max(rate, 0.5)));
}

/**
 * Map spoken text → mouth openness sequence (0–3) for lip-sync pacing.
 * Vowels open more; labials close; spaces/punct pause.
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

  // Collapse long closed runs so motion stays lively but paced to duration
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

/**
 * Speak text with Web Speech API.
 * Cancels any in-progress utterance first.
 *
 * @param {string} text
 * @param {{
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

  window.speechSynthesis.cancel();
  currentUtterance = null;

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 1;
  utterance.pitch = 1.05;
  utterance.volume = 1;

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
  utterance.onboundary = (event) => {
    hooks.onBoundary?.(event);
  };

  const speakNow = () => {
    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  };

  if (!window.speechSynthesis.getVoices().length) {
    const onVoices = () => {
      const v = pickVoice();
      if (v) utterance.voice = v;
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      speakNow();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      if (!currentUtterance) speakNow();
    }, 250);
  } else {
    speakNow();
  }

  return () => {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  };
}

export function cancelDeccoSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}
