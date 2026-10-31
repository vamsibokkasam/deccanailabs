import { AnimatePresence, motion } from "framer-motion";
import { STAGES } from "./heroStory";

export default function SpeechBubble({ stage, reduced }) {
  const line = STAGES[stage]?.bubble ?? STAGES[0].bubble;

  return (
    <div className="scroll-hero-bubble-slot">
      <AnimatePresence mode="wait">
        <motion.p
          key={STAGES[stage]?.id ?? "pick"}
          className="scroll-hero-bubble"
          role="status"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
        >
          {line}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
