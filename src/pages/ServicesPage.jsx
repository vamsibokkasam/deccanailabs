import {
  ArrowRight,
  LayoutTemplate,
  MonitorSmartphone,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import ServiceHero from "../components/services/ServiceHero";
import ServiceCtaBand from "../components/services/ServiceCtaBand";
import ServiceWorkShowcase from "../components/services/ServiceWorkShowcase";
import { services } from "../data/services";
import { serviceWork } from "../data/serviceWork";

const highlights = [
  {
    title: "Website Design",
    description: "Brand sites and online stores built to convert.",
    to: "/services/website-design",
    Icon: LayoutTemplate,
  },
  {
    title: "Dynamic Sites",
    description: "CMS-managed pages you can update yourself.",
    to: "/services/website-design/dynamic",
    Icon: MonitorSmartphone,
  },
  {
    title: "Ecommerce",
    description: "Catalog, checkout, and payments that sell 24/7.",
    to: "/services/website-design/ecommerce",
    Icon: ShoppingBag,
  },
];

function ServicesPage() {
  return (
    <div className="service-shell">
      <ServiceHero
        eyebrow="SERVICES"
        title="Our"
        accent="Services"
        description="Practical digital solutions designed to help your business grow online — from modern websites to conversion-focused stores."
      />

      <section className="service-section">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="service-section-head">
            <p className="theme-label mb-3">FEATURED</p>
            <h2 className="theme-heading">What we can build for you</h2>
            <p className="text-muted text-base md:text-lg leading-relaxed">
              Start with Website Design, then choose the path that fits your goals.
            </p>
          </Reveal>

          <div className="service-feature-grid">
            {highlights.map(({ title, description, to, Icon }, index) => (
              <Reveal key={title} delay={index * 40}>
                <Link to={to} className="service-feature-tile service-feature-tile--link group">
                  <div className="service-feature-icon">
                    <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-fg mb-2 tracking-tight">
                    {title}
                  </h3>
                  <p className="text-muted leading-relaxed text-[15px] mb-4">
                    {description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-accent-hover text-sm font-medium">
                    Learn more
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8" delay={120}>
            <Link
              to={services[0].link}
              className="service-featured-banner group"
            >
              <div>
                <p className="theme-label mb-2">START HERE</p>
                <h3 className="text-xl md:text-2xl font-semibold text-fg tracking-tight">
                  {services[0].title}
                </h3>
                <p className="mt-2 text-muted max-w-2xl">
                  {services[0].description}
                </p>
              </div>
              <span className="service-hero-btn-secondary shrink-0">
                Explore Website Design
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <ServiceWorkShowcase
        eyebrow="SELECTED WORK"
        title="Work you can click through"
        description="Hover a site to scroll through the full website. Click any card to open it."
        items={serviceWork}
        showCategory
      />

      <ServiceCtaBand
        title="Ready to grow online?"
        description="Tell us what you need and we will recommend the right service path with a free quote."
      />
    </div>
  );
}

export default ServicesPage;
