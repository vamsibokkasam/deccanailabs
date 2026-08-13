import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_CATEGORIES } from "../config/site";
import Reveal from "./Reveal";

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

function Faq() {
  const [activeCategory, setActiveCategory] = useState(FAQ_CATEGORIES[0].id);
  const [openIndex, setOpenIndex] = useState(0);

  const category =
    FAQ_CATEGORIES.find((item) => item.id === activeCategory) ||
    FAQ_CATEGORIES[0];

  useEffect(() => {
    setOpenIndex(0);
  }, [activeCategory]);

  return (
    <section className="faq-section theme-section" aria-labelledby="faq-title">
      <div className="max-w-4xl mx-auto">
        <Reveal className="text-center mb-10 md:mb-12">
          <p className="theme-label mb-4">FAQ</p>

          <h2 id="faq-title" className="theme-heading">
            Frequently Asked Questions
          </h2>

          <p className="mt-5 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Need help with something? Here are our most frequently asked
            questions.
          </p>
        </Reveal>

        <Reveal className="faq-tabs" delay={60} role="tablist" aria-label="FAQ categories">
          {FAQ_CATEGORIES.map(({ id, label }) => {
            const active = id === activeCategory;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`faq-tab ${active ? "is-active" : ""}`}
                onClick={() => setActiveCategory(id)}
              >
                {label}
              </button>
            );
          })}
        </Reveal>

        <Reveal className="faq-list-wrap" delay={100}>
          <div className="faq-category-chip">{category.shortLabel}</div>

          <div className="faq-list">
            {category.items.map(({ question, answer }, index) => (
              <FaqItem
                key={`${category.id}-${question}`}
                question={question}
                answer={answer}
                open={openIndex === index}
                onToggle={() =>
                  setOpenIndex((current) => (current === index ? -1 : index))
                }
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Faq;
