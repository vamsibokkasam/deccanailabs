import { ORGANIZATION_CERTIFICATIONS } from "../config/site";
import Reveal from "./Reveal";

function Certifications() {
  return (
    <section
      className="cert-recognition"
      aria-labelledby="cert-recognition-title"
    >
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-12 md:mb-14">
          <p className="theme-label mb-4">CERTIFICATIONS</p>
          <h2 id="cert-recognition-title" className="theme-heading">
            Certified & Trusted
          </h2>
          <div className="cert-recognition-rule mx-auto mt-6" aria-hidden="true" />
          <p className="mt-6 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            DECCAN AI LABS is proudly{" "}
            <span className="text-accent font-semibold">MSME</span>,{" "}
            <span className="text-accent font-semibold">NCS</span>, and{" "}
            <span className="text-accent font-semibold">ISO</span> certified —
            reinforcing our commitment to quality education and trusted training.
          </p>
        </Reveal>

        <Reveal className="cert-recognition-grid" delay={80}>
          {ORGANIZATION_CERTIFICATIONS.map(
            ({ code, title, image, description }, index) => (
              <article
                key={code}
                className="home-reveal-item cert-recognition-item group"
                style={{ "--i": index }}
              >
                <div className="cert-recognition-badge">
                  <div className="cert-recognition-badge-glow" aria-hidden="true" />
                  <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
                <p className="cert-recognition-label">{code}</p>
                <p className="cert-recognition-desc">{description}</p>
              </article>
            ),
          )}
        </Reveal>
      </div>
    </section>
  );
}

export default Certifications;
