import { ArrowRight, LayoutTemplate, Palette, Rocket, Search } from "lucide-react";
import { useInView } from "../hooks/useInView";
import Reveal from "../components/Reveal";
import ServiceHero from "../components/services/ServiceHero";
import ServiceOfferCard from "../components/services/ServiceOfferCard";
import ServiceCtaBand from "../components/services/ServiceCtaBand";
import { websiteAudiences, websiteDesignServices } from "../data/services";

const processSteps = [
  {
    title: "Discover",
    description:
      "We learn your goals, audience, and the kind of website your business needs.",
    hint: "Step 01",
    Icon: Search,
  },
  {
    title: "Design",
    description:
      "We shape a clear layout and visual direction that matches your brand.",
    hint: "Step 02",
    Icon: Palette,
  },
  {
    title: "Build",
    description:
      "We develop a fast, modern site with the features your project requires.",
    hint: "Step 03",
    Icon: LayoutTemplate,
  },
  {
    title: "Launch",
    description:
      "We go live, hand over access, and make sure everything works as expected.",
    hint: "Step 04",
    Icon: Rocket,
  },
];

function WebsiteDesignPage() {
  const [processRef, processInView] = useInView({ threshold: 0.12 });

  return (
    <div className="service-shell">
      <ServiceHero
        eyebrow="SERVICES"
        title="Website"
        accent="Design"
        description="Modern websites built for speed, clarity, and measurable results — from brand sites to conversion-focused stores."
        breadcrumbs={[
          { label: "Services", to: "/services" },
          { label: "Website Design" },
        ]}
      />

      <section className="service-section">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="service-section-head">
            <p className="theme-label mb-3">BUILT FOR</p>
            <h2 className="theme-heading">Teams that need a site that works</h2>
          </Reveal>
          <ul className="service-audience-chips">
            {websiteAudiences.map((item) => (
              <li key={item} className="service-hero-chip">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="service-section pt-0">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="service-section-head">
            <p className="theme-label mb-3">CHOOSE YOUR PATH</p>
            <h2 className="theme-heading">Dynamic or Ecommerce</h2>
            <p className="text-muted text-base md:text-lg leading-relaxed">
              Pick the website type that matches how you want to grow online.
            </p>
          </Reveal>

          <div className="service-offer-grid">
            {websiteDesignServices.map((service, index) => (
              <ServiceOfferCard
                key={service.link}
                title={service.title}
                description={service.description}
                link={service.link}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        ref={processRef}
        className={`strategy-framework service-section service-section--wash ${
          processInView ? "is-inview" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="service-section-head">
            <p className="theme-label mb-3">OUR PROCESS</p>
            <h2 className="theme-heading">Discover. Design. Build. Launch.</h2>
            <p className="text-muted text-base md:text-lg leading-relaxed">
              A clear path from first conversation to a live website that works
              for your business.
            </p>
          </div>

          <ol className="strategy-framework-rail">
            {processSteps.map(({ title, description, hint, Icon }, index) => (
              <li
                key={title}
                className="strategy-framework-step group"
                style={{ "--step-i": index }}
              >
                <article className="strategy-framework-card theme-card theme-card-hover">
                  <div className="strategy-framework-glow" aria-hidden="true" />
                  <div className="relative">
                    <div className="strategy-framework-icon">
                      <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <p className="strategy-framework-hint mb-2">{hint}</p>
                    <h3 className="card-heading-hover text-2xl font-semibold mb-3 transition-colors duration-300">
                      {title}
                    </h3>
                    <p className="text-muted leading-relaxed text-[15px] md:text-base">
                      {description}
                    </p>
                  </div>
                </article>

                {index < processSteps.length - 1 ? (
                  <span
                    className="strategy-framework-connector"
                    aria-hidden="true"
                  >
                    <ArrowRight size={14} strokeWidth={2.25} />
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ServiceCtaBand
        title="Ready to build your website?"
        description="Share your goals and we will recommend Dynamic or Ecommerce with a clear plan and free quote."
      />
    </div>
  );
}

export default WebsiteDesignPage;
