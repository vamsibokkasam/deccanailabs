import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "../Reveal";

function FaqItem({ question, answer, open, onToggle }) {
  return (
    <div className="faq-item">
      <button
        type="button"
        className="faq-trigger"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="faq-question">{question}</span>
        <ChevronDown
          size={18}
          className={`faq-chevron shrink-0 ${open ? "is-open" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div
        className={`faq-answer ${open ? "is-open" : ""}`}
        role="region"
        aria-hidden={!open}
      >
        <p>{answer}</p>
      </div>
    </div>
  );
}

function ServiceFaq({
  titleId,
  heading = "Common questions",
  description,
  items,
}) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="faq-section service-section" aria-labelledby={titleId}>
      <div className="max-w-4xl mx-auto px-6">
        <Reveal className="service-section-head text-center mx-auto">
          <p className="theme-label mb-3">FAQ</p>
          <h2 id={titleId} className="theme-heading">
            {heading}
          </h2>
          {description ? (
            <p className="text-muted text-base md:text-lg leading-relaxed mx-auto">
              {description}
            </p>
          ) : null}
        </Reveal>

        <Reveal className="faq-list-wrap" delay={80}>
          <div className="faq-list">
            {items.map(({ question, answer }, index) => (
              <FaqItem
                key={question}
                question={question}
                answer={answer}
                open={openFaq === index}
                onToggle={() =>
                  setOpenFaq((current) => (current === index ? -1 : index))
                }
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default ServiceFaq;
