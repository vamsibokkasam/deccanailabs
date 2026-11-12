import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { QUOTE_SECTION_ID, scrollToQuote } from "./ServiceQuoteForm";

function ServiceStickyBar({
  label = "Get a free quote",
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById(QUOTE_SECTION_ID);
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (hidden) return null;

  return (
    <div className="service-sticky-bar md:hidden">
      <a
        href={`#${QUOTE_SECTION_ID}`}
        onClick={scrollToQuote}
        className="service-hero-btn-primary w-full justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover/70"
      >
        <Sparkles size={16} aria-hidden="true" />
        {label}
      </a>
    </div>
  );
}

export default ServiceStickyBar;
