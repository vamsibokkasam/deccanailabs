import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DeccoRobot from "./DeccoRobot";
import DeccoAssistant from "./DeccoAssistant";
import { Tilt } from "../motion/Tilt";

const BEATS = [
  {
    id: "intern",
    kicker: "01 · Internship",
    title: "Pick your track",
    detail: "Web, Java, Python, AI, Data, or Security.",
    line: "Hi, I'm Decco. First we pick an internship. No pop quiz.",
  },
  {
    id: "build",
    kicker: "02 · Build",
    title: "Make the project",
    detail: "A real repo. The kind you can demo.",
    line: "Then we build it. I cheer when the tests go green.",
    code: "decco@labs:~$ npm run build\n✓ project ready",
  },
  {
    id: "ship",
    kicker: "03 · Ship",
    title: "Mentor signs off",
    detail: "Feedback, fixes, then you present it.",
    line: "A mentor reviews it. You ship. I do a tiny robot bow.",
  },
];

const SINGLE_CLICK_MS = 280;
const BEAT_MS = 3600;

function DeccoMascot() {
  const [beat, setBeat] = useState(0);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pop, setPop] = useState(0);
  const clickTimer = useRef(0);
  const beatTimer = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const advance = useCallback(() => {
    setBeat((current) => (current + 1) % BEATS.length);
    setPop((current) => current + 1);
  }, []);

  useEffect(() => {
    if (reducedMotion || assistantOpen) return undefined;
    beatTimer.current = window.setInterval(advance, BEAT_MS);
    return () => window.clearInterval(beatTimer.current);
  }, [advance, reducedMotion, assistantOpen]);

  useEffect(() => () => window.clearTimeout(clickTimer.current), []);

  const openAssistant = useCallback(() => {
    window.clearTimeout(clickTimer.current);
    setAssistantOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setAssistantOpen(false);
  }, []);

  const onClick = () => {
    window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(advance, SINGLE_CLICK_MS);
  };

  const onDoubleClick = (event) => {
    event.preventDefault();
    openAssistant();
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      advance();
    }
  };

  const active = BEATS[beat];

  return (
    <>
      <div
        className={`decco-mascot decco-scene${reducedMotion ? " is-reduced" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={`${active.line} Click for the next step. Double-click to chat with Decco.`}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
      >
        <Tilt
          className="decco-scene-tilt"
          rotationFactor={9}
          disabled={reducedMotion}
          springOptions={{ stiffness: 220, damping: 24 }}
        >
          <div className="decco-speech-slot">
            <AnimatePresence>
              <motion.p
                key={active.id}
                className="decco-speech"
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                {active.line}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="decco-scene-cards">
            {BEATS.map((item, index) => (
              <motion.article
                key={item.id}
                className={`decco-story-card decco-story-card--${item.id}${item.id === active.id ? " is-active" : ""}`}
                style={{ z: 12 + index * 8 }}
                initial={reducedMotion ? false : { y: 16 }}
                animate={
                  reducedMotion
                    ? { y: 0 }
                    : { y: [0, index % 2 === 0 ? -9 : 9, 0] }
                }
                transition={
                  reducedMotion
                    ? { duration: 0.01 }
                    : { duration: 4.4 + index * 0.35, repeat: Infinity, delay: index * 0.12 }
                }
              >
                <p className="decco-story-kicker">{item.kicker}</p>
                <h2 className="decco-story-title">{item.title}</h2>
                <p className="decco-story-detail">{item.detail}</p>
                {item.code ? <pre className="decco-terminal">{item.code}</pre> : null}
              </motion.article>
            ))}
          </div>

          <motion.div
            className="decco-scene-robot"
            animate={reducedMotion ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 5.2, repeat: Infinity }}
          >
            <DeccoRobot key={pop} className="decco-scene-photo" />
          </motion.div>
        </Tilt>
        <p className="decco-scene-hint">Click Decco · the story moves</p>
      </div>

      <DeccoAssistant open={assistantOpen} onClose={closeAssistant} />
    </>
  );
}

export default DeccoMascot;
