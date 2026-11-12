import Reveal from "../Reveal";
import ServiceQuoteForm, { QUOTE_SECTION_ID } from "./ServiceQuoteForm";

function ServiceCtaBand({
  eyebrow = "NEXT STEP",
  title,
  description,
}) {
  return (
    <section id={QUOTE_SECTION_ID} className="service-section pt-0">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="service-cta service-cta--quote">
            <div className="service-quote-head">
              <p className="theme-label mb-3">{eyebrow}</p>
              <h2 className="theme-heading">{title}</h2>
              {description ? (
                <p className="mt-3 text-muted text-base md:text-lg leading-relaxed">
                  {description}
                </p>
              ) : null}
            </div>
            <ServiceQuoteForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default ServiceCtaBand;
