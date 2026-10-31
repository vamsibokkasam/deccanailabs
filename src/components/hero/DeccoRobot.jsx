import { useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { MANUAL_POSE } from "./heroStory";

const IMAGE = "/DECCO.jpeg";

/**
 * Scroll pose sits on the outer shell. Idle float sits inside it.
 */
export default function DeccoRobot({
  x,
  y,
  rotateY,
  rotateZ,
  scale,
  pointerX,
  pointerY,
  reduced,
  pinned,
  stage,
  onActivate,
  onOpenChat,
}) {
  const tiltXRaw = useTransform(pointerY, [-0.5, 0.5], [7, -7]);
  const tiltYRaw = useTransform(pointerX, [-0.5, 0.5], [-9, 9]);
  const tiltX = useSpring(tiltXRaw, { stiffness: 160, damping: 18 });
  const tiltY = useSpring(tiltYRaw, { stiffness: 160, damping: 18 });
  const shadow = useTransform(y, [-36, 0, 48], [0.72, 1, 1.16]);
  const clickTimer = useRef(0);
  const pose = pinned && !reduced
    ? { x, y, rotateY, rotateZ, scale }
    : MANUAL_POSE[stage] ?? MANUAL_POSE[0];

  const onClick = () => {
    window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(onActivate, 260);
  };

  const onDoubleClick = (event) => {
    event.preventDefault();
    window.clearTimeout(clickTimer.current);
    onOpenChat?.();
  };

  return (
    <motion.div
      className="scroll-hero-robot-tilt"
      style={reduced ? undefined : { rotateX: tiltX, rotateY: tiltY }}
    >
      <motion.div className="scroll-hero-robot-pose" style={pose}>
        <motion.div
          className="scroll-hero-shadow"
          style={reduced ? undefined : { scaleX: shadow, scaleY: shadow }}
          aria-hidden="true"
        />
        <motion.button
          type="button"
          className="scroll-hero-robot"
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          animate={reduced ? undefined : { y: [0, -12, 0] }}
          transition={reduced ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
          aria-label="Decco, the DECCAN AI LABS robot. Click to move the story forward."
        >
          <motion.img
            src={IMAGE}
            alt="Decco, the DECCAN AI LABS robot mascot, waving"
            className="scroll-hero-photo"
            draggable={false}
            fetchPriority="high"
          />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
