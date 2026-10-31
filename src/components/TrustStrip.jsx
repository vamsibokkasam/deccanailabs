import { BRAND_LEGAL_NAME } from "../config/branding";
import { ORGANIZATION_CERTIFICATIONS } from "../config/site";

function TrustStrip() {
  return (
    <section className="trust-strip" data-cine aria-label="Company certifications">
      <div className="max-w-7xl mx-auto px-6">
        <p className="trust-strip-legal" data-cine-head>
          {BRAND_LEGAL_NAME}
        </p>
        <ul className="trust-strip-list">
          {ORGANIZATION_CERTIFICATIONS.map(({ code, title, image }) => (
            <li key={code} className="trust-chip" data-cine-card>
              <span className="trust-chip-logo">
                <img src={image} alt="" />
              </span>
              <span className="trust-chip-title">{title}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TrustStrip;
