import {
  CreditCard,
  MessageCircle,
  Package,
  PackageSearch,
  ShoppingBag,
  ShoppingCart,
  Warehouse,
} from "lucide-react";
import Reveal from "../components/Reveal";
import ServiceHero from "../components/services/ServiceHero";
import ServiceFaq from "../components/services/ServiceFaq";
import ServiceCtaBand from "../components/services/ServiceCtaBand";
import ServiceStickyBar from "../components/services/ServiceStickyBar";
import EcommerceVisual from "../components/services/visuals/EcommerceVisual";

const features = [
  {
    title: "Product catalog",
    description: "Clear images, pricing, variants, and categories.",
    Icon: Package,
  },
  {
    title: "Cart and checkout",
    description: "A smooth path from browse to completed order.",
    Icon: ShoppingCart,
  },
  {
    title: "Payment gateway",
    description: "Secure UPI, cards, and Razorpay-ready checkout.",
    Icon: CreditCard,
  },
  {
    title: "Order tracking",
    description: "Status updates from purchase to delivery.",
    Icon: PackageSearch,
  },
  {
    title: "Inventory management",
    description: "Keep stock accurate and avoid overselling.",
    Icon: Warehouse,
  },
  {
    title: "WhatsApp order option",
    description: "Let customers enquire or order over chat.",
    Icon: MessageCircle,
  },
];

const faqs = [
  {
    question: "Can I accept online payments on my store?",
    answer:
      "Yes. We can connect a payment gateway such as Razorpay so customers can pay securely with UPI, cards, and other supported methods.",
  },
  {
    question: "Will I be able to manage products and orders myself?",
    answer:
      "Yes. You get an admin area to add products, update stock, check orders, and keep the store running day to day without needing us for every change.",
  },
  {
    question: "Do you support WhatsApp ordering as well?",
    answer:
      "Yes. Alongside the full checkout flow, we can add a WhatsApp option so customers can ask questions or place orders through chat when that works better for them.",
  },
];

function EcommerceWebsiteDesignPage() {
  return (
    <div className="service-shell service-shell--sticky">
      <ServiceHero
        eyebrow="WEBSITE DESIGN"
        title="Ecommerce Website"
        accent="Design"
        description="Online stores built to showcase products, take payments, and keep selling 24/7."
        primaryLabel="Start your online store"
        breadcrumbs={[
          { label: "Services", to: "/services" },
          { label: "Website Design", to: "/services/website-design" },
          { label: "Ecommerce" },
        ]}
        visual={<EcommerceVisual />}
        visualLabel="Ecommerce product cards, shopping cart, and secure payment badge"
      />

      <section className="service-section">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="service-section-head">
            <p className="theme-label mb-3">WHAT&apos;S INCLUDED</p>
            <h2 className="theme-heading">Everything a modern store needs</h2>
            <p className="text-muted text-base md:text-lg leading-relaxed">
              From catalog to checkout, we set up the tools that help customers
              buy and help you manage sales with less friction.
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
        titleId="ecommerce-faq-title"
        description="Straight answers about launching and running your online store."
        items={faqs}
      />

      <ServiceCtaBand
        title="Ready to sell online?"
        description="Tell us what you sell and we will help you plan a store that works for your business."
        buttonLabel="Start your online store"
        icon={ShoppingBag}
      />

      <ServiceStickyBar label="Start your online store" />
    </div>
  );
}

export default EcommerceWebsiteDesignPage;
