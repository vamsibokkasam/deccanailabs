import { useCallback, useEffect, useRef, useState } from "react";
import DeccoRobot, {
  DECCO_IDLE_VIDEO,
  DECCO_WAKEUP_VIDEO,
} from "./DeccoRobot";
import DeccoAssistant from "./DeccoAssistant";
import { DECCO_STATES } from "./deccoTypes";

const SINGLE_CLICK_MS = 280;

/**
 * Interactive Decco mascot controller.
 * Single click plays the wakeup video. Double-click opens chat.
 */
function DeccoMascot() {
  const [state, setState] = useState(DECCO_STATES.IDLE);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [awake, setAwake] = useState(false);
  const rootRef = useRef(null);
  const clickTimer = useRef(0);
  const awakeRef = useRef(false);

  awakeRef.current = awake;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(clickTimer.current);
  }, []);

  const wakeDecco = useCallback(() => {
    setAwake(true);
    awakeRef.current = true;
  }, []);

  const openAssistant = useCallback(() => {
    window.clearTimeout(clickTimer.current);
    setAwake(true);
    awakeRef.current = true;
    setAssistantOpen(true);
    setState(DECCO_STATES.IDLE);
  }, []);

  const closeAssistant = useCallback(() => {
    setAssistantOpen(false);
    setState(DECCO_STATES.IDLE);
  }, []);

  const onPresence = useCallback((presence) => {
    if (presence === "thinking") setState(DECCO_STATES.THINKING);
    else if (presence === "listening") setState(DECCO_STATES.LISTENING);
    else setState(DECCO_STATES.IDLE);
  }, []);

  const onPointerEnter = () => {
    if (state === DECCO_STATES.IDLE || state === DECCO_STATES.HOVER) {
      setState(DECCO_STATES.HOVER);
    }
  };

  const onPointerLeave = () => {
    if (state === DECCO_STATES.HOVER) setState(DECCO_STATES.IDLE);
  };

  const onClick = () => {
    window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => {
      if (!awakeRef.current) wakeDecco();
    }, SINGLE_CLICK_MS);
  };

  const onDoubleClick = (event) => {
    event.preventDefault();
    openAssistant();
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!awakeRef.current) wakeDecco();
      else openAssistant();
    }
  };

  return (
    <>
      <div
        ref={rootRef}
        className="decco-mascot"
        role="button"
        tabIndex={0}
        aria-label="Decco, DECCAN AI LABS AI mascot. Click to wake. Double-click to chat."
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
      >
        <DeccoRobot
          state={state}
          reducedMotion={reducedMotion}
          className="decco-robot-stage"
          src={awake ? DECCO_WAKEUP_VIDEO : DECCO_IDLE_VIDEO}
        />
      </div>

      <DeccoAssistant
        open={assistantOpen}
        onClose={closeAssistant}
        onPresence={onPresence}
      />
    </>
  );
}

export default DeccoMascot;
