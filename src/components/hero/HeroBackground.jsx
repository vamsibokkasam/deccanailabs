import { motion, useTransform } from "framer-motion";

export default function HeroBackground({ pointerX, pointerY }) {
  const farX = useTransform(pointerX, [-0.5, 0.5], [-14, 14]);
  const farY = useTransform(pointerY, [-0.5, 0.5], [-10, 10]);
  const nearX = useTransform(pointerX, [-0.5, 0.5], [-32, 32]);
  const nearY = useTransform(pointerY, [-0.5, 0.5], [-22, 22]);

  return (
    <div className="scroll-hero-bg" aria-hidden="true">
      <motion.div className="scroll-hero-gridlines" style={{ x: farX, y: farY }} />
      <motion.div className="scroll-hero-spotlight" style={{ x: nearX, y: nearY }} />
    </div>
  );
}
