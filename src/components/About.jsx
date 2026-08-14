import { ORGANIZATION_GSTIN } from "../config/branding";
import { BRAND_DISAMBIGUATION } from "../config/site";
import Reveal from "./Reveal";

function About() {
  return (
    <section className="about-section theme-section">
      <div className="max-w-7xl mx-auto">
        <Reveal className="about-intro max-w-3xl mx-auto text-center">
          <p className="theme-label mb-4">ABOUT US</p>
          <h2 className="theme-heading mb-5 md:mb-6">About Us</h2>
          <div className="about-intro-rule mx-auto mb-7 md:mb-8" aria-hidden="true" />

          <p className="about-intro-copy">
            DECCAN AI LABS Private Limited (DeccanAILabs) is a company
            incorporated in India (GST No. {ORGANIZATION_GSTIN}). We are a
            technology education and training platform helping students and
            early-career professionals build practical skills through mentor-led
            internships, project-based learning, and industry-focused courses in
            AI, programming, data science, and cyber security.
          </p>

          <p className="about-intro-copy mt-5 md:mt-6">
            Founded with the vision of bridging the gap between education and
            industry, DECCAN AI LABS serves as a catalyst for transformation by
            empowering learners with the knowledge, skills, and opportunities
            required to thrive in a rapidly evolving digital world. We are{" "}
            <span className="about-cert">MSME</span>,{" "}
            <span className="about-cert">NCS</span>, and{" "}
            <span className="about-cert">ISO</span> certified.
          </p>

          <aside className="about-intro-note">
            <h3 className="about-intro-note-title">
              Not affiliated with Deccan AI Experts
            </h3>
            <p>{BRAND_DISAMBIGUATION}</p>
          </aside>

          <p className="about-intro-belief">
            We believe that the future belongs to those who continuously learn,
            innovate, and adapt.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default About;
