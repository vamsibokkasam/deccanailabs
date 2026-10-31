import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue } from "framer-motion";
import { useDeccoScroll } from "../../hooks/useDeccoScroll";
import DeccoAssistant from "../decco/DeccoAssistant";
import DeccoRobot from "./DeccoRobot";
import HeroBackground from "./HeroBackground";
import SpeechBubble from "./SpeechBubble";
import StageDots from "./StageDots";
import StepCard from "./StepCard";
import { STAGES } from "./heroStory";

const PILLS = ["Learn with mentors", "Build real projects", "Grow into leadership"];

function enter(reduced, delay) {
  if (reduced) return {};
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: "easeOut" },
  };
}

export default function ScrollHero() {
  const sectionRef = useRef(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const [reduced, setReduced] = useState(false);
  const [compact, setCompact] = useState(false);
  const [manual, setManual] = useState(0);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const scroll = useDeccoScroll(sectionRef);
  const pinned = !reduced && !compact;
  const stage = pinned ? scroll.stage : manual;

  useEffect(() => {
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactMq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setReduced(reduceMq.matches);
      setCompact(compactMq.matches);
    };
    apply();
    reduceMq.addEventListener?.("change", apply);
    compactMq.addEventListener?.("change", apply);
    return () => {
      reduceMq.removeEventListener?.("change", apply);
      compactMq.removeEventListener?.("change", apply);
    };
  }, []);

  const goTo = useCallback((index) => {
    const next = ((index % STAGES.length) + STAGES.length) % STAGES.length;
    if (!pinned) {
      setManual(next);
      return;
    }
    const element = sectionRef.current;
    if (!element) return;
    const top = window.scrollY + element.getBoundingClientRect().top;
    const total = Math.max(element.offsetHeight - window.innerHeight, 1);
    const marks = [0.06, 0.5, 0.92];
    window.scrollTo({ top: top + total * marks[next], behavior: "smooth" });
  }, [pinned]);

  const onPointerMove = (event) => {
    if (reduced || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      ref={sectionRef}
      className={`scroll-hero${pinned ? " is-pinned" : " is-stacked"}`}
      aria-label="Decco internship story"
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <div className="scroll-hero-sticky">
        <HeroBackground pointerX={pointerX} pointerY={pointerY} />
        <div className="scroll-hero-layout">
          <div className="scroll-hero-copy">
            <motion.div style={pinned ? { opacity: scroll.headlineOpacity, y: scroll.headlineY } : undefined}>
              <motion.h1 className="scroll-hero-title" {...enter(reduced, 0.08)}>
                Learn the work.
                <span className="scroll-hero-accent">Lead with it.</span>
              </motion.h1>
              <motion.p className="scroll-hero-intro" {...enter(reduced, 0.16)}>
                Mentor-led internships and industry-focused courses in AI,
                programming, data science, and cyber security. MSME, NCS, ISO, StartupIndia, and AICTE certified.
              </motion.p>
            </motion.div>

            <motion.ol className="scroll-hero-pills" {...enter(reduced, 0.24)}>
              {PILLS.map((pill) => (
                <li key={pill}>{pill}</li>
              ))}
            </motion.ol>

            <motion.div
              className={`scroll-hero-actions${stage === 2 ? " is-ship" : ""}`}
              style={pinned ? { opacity: scroll.ctaOpacity } : undefined}
              {...enter(reduced, 0.32)}
            >
              <Link to="/internships" className="theme-btn-primary">
                Explore Internships
              </Link>
              <Link to="/contact" className="theme-btn-outline">
                Contact Us
              </Link>
            </motion.div>
          </div>

          <div className="scroll-hero-stage">
            <StageDots stage={stage} onSelect={goTo} />
            <SpeechBubble stage={stage} reduced={reduced} />
            <div className="scroll-hero-cards">
              {STAGES.map((item, index) => (
                <StepCard
                  key={item.id}
                  stage={item}
                  active={index === stage}
                  dimmed={index !== stage}
                />
              ))}
            </div>
            <DeccoRobot
              x={scroll.x}
              y={scroll.y}
              rotateY={scroll.rotateY}
              rotateZ={scroll.rotateZ}
              scale={scroll.scale}
              pointerX={pointerX}
              pointerY={pointerY}
              reduced={reduced}
              pinned={pinned}
              stage={stage}
              onActivate={() => goTo(stage + 1)}
              onOpenChat={() => setAssistantOpen(true)}
            />
            <p className="scroll-hero-hint">Scroll, or click Decco · the story moves</p>
          </div>
        </div>
      </div>
      <DeccoAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </section>
  );
}
