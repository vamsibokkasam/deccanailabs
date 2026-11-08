import {
  BarChart3,
  FileEdit,
  FormInput,
  Gauge,
  MonitorSmartphone,
  SearchCheck,
} from "lucide-react";
import Reveal from "../components/Reveal";
import ServiceHero from "../components/services/ServiceHero";
import ServiceFaq from "../components/services/ServiceFaq";
import ServiceCtaBand from "../components/services/ServiceCtaBand";
import ServiceStickyBar from "../components/services/ServiceStickyBar";
import DynamicWebsiteVisual from "../components/services/visuals/DynamicWebsiteVisual";

const features = [
  {
    title: "Responsive layout",
    description: "Looks sharp on phones, tablets, and desktops.",
    Icon: MonitorSmartphone,
  },
  {
    title: "Admin-editable content",
    description: "Update text and images yourself through a CMS.",
    Icon: FileEdit,
  },
  {
    title: "SEO-ready structure",
    description: "Clean titles, metadata, and page structure.",
    Icon: SearchCheck,
  },
  {
    title: "Fast loading",
    description: "Optimized performance so visitors stay and convert.",
    Icon: Gauge,
  },
  {
    title: "Contact forms",
    description: "Enquiry forms that send leads to your inbox.",
    Icon: FormInput,
  },
  {
    title: "Analytics setup",
    description: "Track visits, clicks, and what converts.",
    Icon: BarChart3,
  },
];

const faqs = [
  {
    question: "What does “dynamic” website mean?",
    answer:
      "It means your site is connected to a content management system. You can change pages, text, and images without needing a developer for every small update.",
  },
  {
    question: "Will I be able to edit the site myself?",
    answer:
      "Yes. After launch we give you admin access and a short walkthrough so you can update common content on your own with confidence.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Most business sites take a few weeks from discovery to launch, depending on how many pages you need and how quickly content is ready.",
  },
];

function DynamicWebsiteDesignPage() {
  return (
    <div className="service-shell service-shell--sticky">
      <ServiceHero
        eyebrow="WEBSITE DESIGN"
        title="Dynamic Website"
        accent="Design"
        description="CMS-managed websites that stay easy to update, fast to load, and clear for your customers."
        breadcrumbs={[
          { label: "Services", to: "/services" },
          { label: "Website Design", to: "/services/website-design" },
          { label: "Dynamic" },
        ]}
        visual={<DynamicWebsiteVisual />}
        visualLabel="CMS content editor next to a live website preview"
      />

      <section className="service-section">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="service-section-head">
            <p className="theme-label mb-3">WHAT&apos;S INCLUDED</p>
            <h2 className="theme-heading">Built for real business use</h2>
            <p className="text-muted text-base md:text-lg leading-relaxed">
              Everything you need to launch a modern site you can manage without
              constant developer help.
            </p>
          </Reveal>

          <div className="service-feature-grid">
            {features.map(({ title, description, Icon }, index) => (
              <Reveal key={title} delay={index * 35}>
                <article className="service-feature-tile">
                  <div className="service-feature-icon">
                    <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-fg mb-2 tracking-tight">
                    {title}
                  </h3>
                  <p className="text-muted leading-relaxed text-[15px]">
                    {description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ServiceFaq
        titleId="dynamic-faq-title"
        description="Straight answers about how a dynamic website works for your business."
        items={faqs}
      />

      <ServiceCtaBand
        title="Ready to build your site?"
        description="Tell us about your business and we will share a clear plan and free quote."
      />

      <ServiceStickyBar />
    </div>
  );
}

export default DynamicWebsiteDesignPage;
