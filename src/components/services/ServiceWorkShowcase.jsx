import { ArrowUpRight } from "lucide-react";
import Reveal from "../Reveal";
import { CATEGORY_LABELS } from "../../data/serviceWork";
import LiveSitePreview from "./LiveSitePreview";

function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function WorkCard({ item, index, showCategory = false }) {
  const isLive = item.kind === "live";
  const badge = isLive ? "Live website" : "Demo";
  const cta = isLive ? "Visit live site" : "Open live demo";

  return (
    <Reveal
      delay={index * 60}
      className={`h-full${item.featured ? " service-work-cell--featured" : ""}`}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`service-work-card group ${
          item.featured ? "service-work-card--featured" : ""
        }`}
      >
        <div className="service-work-preview">
          <div className="service-work-chrome" aria-hidden="true">
            <div className="service-work-chrome-dots">
              <span />
              <span />
              <span />
            </div>
            <p>{hostnameFromUrl(item.url)}</p>
          </div>
          <div className="service-work-shot-wrap">
            <LiveSitePreview image={item.image} title={item.title} />
            <span
              className={`service-work-badge ${
                isLive ? "service-work-badge--live" : ""
              }`}
            >
              {badge}
            </span>
          </div>
        </div>

        <div className="service-work-body">
          <div className="service-work-copy">
            {showCategory && CATEGORY_LABELS[item.category] ? (
              <p className="service-work-kicker">
                {CATEGORY_LABELS[item.category]}
              </p>
            ) : null}
            <h3 className="service-work-title">{item.title}</h3>
            <p className="service-work-desc">{item.description}</p>
          </div>
          <span className="service-work-cta">
            {cta}
            <ArrowUpRight size={15} aria-hidden="true" />
          </span>
        </div>
      </a>
    </Reveal>
  );
}

function ServiceWorkShowcase({
  eyebrow = "SELECTED WORK",
  title = "Sites you can click through",
  description = "Hover a site to scroll through the full website. Click to open it in a new tab.",
  items = [],
  showCategory = false,
}) {
  if (!items.length) return null;

  const layout =
    items.length === 1
      ? "service-work-grid--solo"
      : items.some((item) => item.featured)
        ? "service-work-grid--featured"
        : "service-work-grid--even";

  return (
    <section id="selected-work" className="service-section service-section--wash">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="service-section-head">
          <p className="theme-label mb-3">{eyebrow}</p>
          <h2 className="theme-heading">{title}</h2>
          {description ? (
            <p className="text-muted text-base md:text-lg leading-relaxed">
              {description}
            </p>
          ) : null}
        </Reveal>

        <div className={`service-work-grid ${layout}`}>
          {items.map((item, index) => (
            <WorkCard
              key={item.id}
              item={item}
              index={index}
              showCategory={showCategory}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceWorkShowcase;
