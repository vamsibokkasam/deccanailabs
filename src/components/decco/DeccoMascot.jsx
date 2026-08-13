import { useCallback, useEffect, useRef, useState } from "react";
import DeccoRobot from "./DeccoRobot";
import DeccoAssistant from "./DeccoAssistant";
import { DECCO_STATES, GREETING_CAPTION, GREETING_TEXT } from "./deccoTypes";
import {
  buildMouthTimeline,
  cancelDeccoSpeech,
  estimateSpeechDurationMs,
  speakDecco,
} from "./deccoSpeech";

const CLICK_DELAY_MS = 280;

/**
 * Interactive Decco mascot controller.
 * Uses the exact public/DECCO.jpeg robot (isolated from its plate).
 * Hero background/text stay static — only Decco animates.
 */
function DeccoMascot() {
  const [state, setState] = useState(DECCO_STATES.IDLE);
  const [mouth, setMouth] = useState(0);
  const [lookX, setLookX] = useState(0);
  const [lookY, setLookY] = useState(0);
  const [caption, setCaption] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const rootRef = useRef(null);
  const clickTimer = useRef(null);
  const cancelSpeech = useRef(null);
  const mouthTimer = useRef(null);
  const mouthTimers = useRef([]);
  const busyRef = useRef(false);
  const assistantOpenRef = useRef(false);
  /** When false, no mouth keyframe / boundary may update the face. */
  const speakingRef = useRef(false);
  /** Bumped on every stop so late timeouts become no-ops. */
  const mouthSessionRef = useRef(0);

  useEffect(() => {
    assistantOpenRef.current = assistantOpen;
  }, [assistantOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const clearMouthTimers = useCallback(() => {
    if (mouthTimer.current) {
      window.clearTimeout(mouthTimer.current);
      mouthTimer.current = null;
    }
    for (const id of mouthTimers.current) window.clearTimeout(id);
    mouthTimers.current = [];
  }, []);

  useEffect(() => {
    return () => {
      speakingRef.current = false;
      mouthSessionRef.current += 1;
      if (clickTimer.current) window.clearTimeout(clickTimer.current);
      clearMouthTimers();
      cancelSpeech.current?.();
      cancelDeccoSpeech();
    };
  }, [clearMouthTimers]);

  const stopMouth = useCallback(() => {
    speakingRef.current = false;
    mouthSessionRef.current += 1;
    clearMouthTimers();
    setMouth(0);
  }, [clearMouthTimers]);

  /**
   * Pace mouth shapes to estimated speech duration + text phoneme cues.
   * Starts only when TTS actually starts (caller uses onStart).
   */
  const startMouthSynced = useCallback(
    (text) => {
      clearMouthTimers();
      setMouth(0);
      speakingRef.current = true;
      const session = mouthSessionRef.current;

      if (reducedMotion) {
        if (speakingRef.current && mouthSessionRef.current === session) {
          setMouth(1);
        }
        return;
      }

      const durationMs = estimateSpeechDurationMs(text, 1);
      const timeline = buildMouthTimeline(text, durationMs);

      const applyMouth = (value) => {
        if (!speakingRef.current || mouthSessionRef.current !== session) return;
        setMouth(value);
      };

      for (const frame of timeline) {
        const id = window.setTimeout(() => {
          applyMouth(frame.mouth);
        }, frame.at);
        mouthTimers.current.push(id);
      }

      // Soft close near estimated end (onEnd is the real authority)
      const closeAt = Math.max(durationMs - 80, durationMs * 0.94);
      mouthTimers.current.push(
        window.setTimeout(() => applyMouth(0), closeAt)
      );
    },
    [clearMouthTimers, reducedMotion]
  );

  /** Word boundaries briefly open the mouth (when browser fires them). */
  const onSpeechBoundary = useCallback(
    (event) => {
      if (!speakingRef.current || reducedMotion) return;
      if (event?.name !== "word" && event?.name !== "sentence") return;

      const session = mouthSessionRef.current;
      setMouth((prev) => (prev >= 2 ? 3 : 2));

      const id = window.setTimeout(() => {
        if (!speakingRef.current || mouthSessionRef.current !== session) return;
        setMouth((prev) => (prev === 0 ? 0 : 1));
      }, 70);
      mouthTimers.current.push(id);
    },
    [reducedMotion]
  );

  const speak = useCallback(
    (text, { showCaption = true } = {}) => {
      cancelSpeech.current?.();
      stopMouth();
      if (showCaption) setCaption(text);
      setState(DECCO_STATES.SPEAKING);

      cancelSpeech.current = speakDecco(text, {
        onStart: () => {
          // Mouth begins only when audio actually starts
          startMouthSynced(text);
        },
        onBoundary: onSpeechBoundary,
        onEnd: () => {
          // Kill mouth immediately — ignore any late boundary/timers
          stopMouth();
          setCaption("");
          setState(
            assistantOpenRef.current
              ? DECCO_STATES.LISTENING
              : DECCO_STATES.IDLE
          );
          busyRef.current = false;
        },
        onError: () => {
          stopMouth();
          setCaption("");
          setState(
            assistantOpenRef.current
              ? DECCO_STATES.LISTENING
              : DECCO_STATES.IDLE
          );
          busyRef.current = false;
        },
      });
    },
    [onSpeechBoundary, startMouthSynced, stopMouth]
  );

  /** Click greeting: Hi + speech + mouth only (no hand wave). */
  const playGreeting = useCallback(() => {
    if (busyRef.current || assistantOpen) return;
    busyRef.current = true;
    setCaption(GREETING_CAPTION);
    speak(GREETING_TEXT);
  }, [assistantOpen, speak]);

  const openAssistant = useCallback(() => {
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    cancelSpeech.current?.();
    cancelDeccoSpeech();
    stopMouth();
    setCaption("");
    setAssistantOpen(true);
    setState(DECCO_STATES.LISTENING);
    busyRef.current = false;
  }, [stopMouth]);

  const closeAssistant = useCallback(() => {
    cancelSpeech.current?.();
    cancelDeccoSpeech();
    stopMouth();
    setCaption("");
    setAssistantOpen(false);
    setState(DECCO_STATES.IDLE);
    busyRef.current = false;
  }, [stopMouth]);

  const onPointerMove = (event) => {
    if (reducedMotion || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    setLookX(Math.max(-1, Math.min(1, x)));
    setLookY(Math.max(-1, Math.min(1, y)));
  };

  const onPointerEnter = () => {
    if (
      state === DECCO_STATES.IDLE ||
      state === DECCO_STATES.HOVER
    ) {
      setState(DECCO_STATES.HOVER);
    }
  };

  const onPointerLeave = () => {
    setLookX(0);
    setLookY(0);
    if (state === DECCO_STATES.HOVER) setState(DECCO_STATES.IDLE);
  };

  const onClick = () => {
    // Single vs double click discrimination
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      openAssistant();
      return;
    }
    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null;
      playGreeting();
    }, CLICK_DELAY_MS);
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      openAssistant();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      playGreeting();
    }
  };

  return (
    <>
      <div
        ref={rootRef}
        className="decco-mascot"
        role="button"
        tabIndex={0}
        aria-label="Decco, DECCAN AI LABS AI mascot. Click to greet. Double-click to chat."
        onPointerMove={onPointerMove}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
        onDoubleClick={(e) => {
          e.preventDefault();
          openAssistant();
        }}
        onKeyDown={onKeyDown}
      >
        {caption ? (
          <div className="decco-hai" aria-live="polite">
            {caption.length > 42 ? "Hi! 👋" : caption}
          </div>
        ) : null}

        <DeccoRobot
          state={state}
          reducedMotion={reducedMotion}
          className="decco-robot-stage"
        />
      </div>

      <DeccoAssistant
        open={assistantOpen}
        onClose={closeAssistant}
        onSpeak={(text) => speak(text, { showCaption: false })}
        onListeningChange={(on) =>
          setState(on ? DECCO_STATES.LISTENING : DECCO_STATES.IDLE)
        }
        onThinkingChange={(on) =>
          setState(on ? DECCO_STATES.THINKING : DECCO_STATES.LISTENING)
        }
      />
    </>
  );
}

export default DeccoMascot;
