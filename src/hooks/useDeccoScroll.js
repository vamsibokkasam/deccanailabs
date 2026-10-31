import { useEffect, useState } from "react";
import { useScroll, useSpring, useTransform } from "framer-motion";
import { POSE, STAGE_CUTS } from "../components/hero/heroStory";

function stageFromProgress(value) {
  if (value < STAGE_CUTS[0]) return 0;
  if (value < STAGE_CUTS[1]) return 1;
  return 2;
}

/**
 * Scroll progress for the pinned hero.
 * `scrollYProgress` is smoothed. Pose values are ready for a motion image
 * or, later, a React Three Fiber model.
 */
export function useDeccoScroll(sectionRef) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  const x = useTransform(smooth, POSE.x[0], POSE.x[1]);
  const y = useTransform(smooth, POSE.y[0], POSE.y[1]);
  const rotateY = useTransform(smooth, POSE.rotateY[0], POSE.rotateY[1]);
  const rotateZ = useTransform(smooth, POSE.rotateZ[0], POSE.rotateZ[1]);
  const scale = useTransform(smooth, POSE.scale[0], POSE.scale[1]);
  const headlineOpacity = useTransform(smooth, [0, 0.28, 0.42, 0.62, 0.78, 1], [1, 1, 0.2, 0.2, 1, 1]);
  const headlineY = useTransform(smooth, [0, 0.28, 0.45, 0.72, 1], [0, 0, -32, -32, 0]);
  const ctaOpacity = useTransform(smooth, [0, 0.28, 0.42, 0.68, 0.86, 1], [1, 1, 0, 0, 1, 1]);

  const [stage, setStage] = useState(0);

  useEffect(() => {
    const apply = (value) => {
      const next = stageFromProgress(value);
      setStage((current) => (current === next ? current : next));
    };
    apply(smooth.get());
    return smooth.on("change", apply);
  }, [smooth]);

  return {
    scrollYProgress: smooth,
    x,
    y,
    rotateY,
    rotateZ,
    scale,
    headlineOpacity,
    headlineY,
    ctaOpacity,
    stage,
  };
}
