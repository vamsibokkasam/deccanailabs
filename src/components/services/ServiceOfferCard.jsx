import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

function ServiceOfferCard({ title, description, link, index = 0 }) {
  return (
    <Link
      to={link}
      className="service-offer-card service-offer-card--text group"
      style={{ "--card-i": index }}
    >
      <div className="service-offer-card-body">
        <h2 className="service-offer-card-title">{title}</h2>
        <p className="service-offer-card-desc">{description}</p>
        <span className="service-offer-card-cta">
          Explore
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export default ServiceOfferCard;
