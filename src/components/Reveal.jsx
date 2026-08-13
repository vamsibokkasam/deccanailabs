import { useInView } from "../hooks/useInView";

/**
 * Scroll-triggered reveal wrapper (Tap Academy–style section entrances).
 */
function Reveal({
  as: Tag = "div",
  className = "",
  children,
  threshold = 0.14,
  delay = 0,
  variant = "up",
  ...rest
}) {
  const [ref, inView] = useInView({ threshold });

  return (
    <Tag
      ref={ref}
      className={`home-reveal home-reveal--${variant} ${
        inView ? "is-inview" : ""
      } ${className}`}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
