import { Link } from "react-router-dom";
import LegalPageLayout, { LegalSection } from "../components/LegalPageLayout";

function HelpSupportPage() {
  return (
    <LegalPageLayout label="SUPPORT" title="Help & Support">
      <p>
        At DECCAN AI labs, we are committed to providing timely assistance and
        support to our students, interns, applicants, and website visitors.
      </p>

      <p>
        Users requiring assistance regarding internship applications,
        program-related queries, technical issues, certificates, or general
        information may contact our support team through the official
        communication channels provided below.
      </p>

      <p>
        We strive to respond to all legitimate inquiries within a reasonable
        timeframe and make every effort to ensure a smooth and satisfactory
        experience for all users.
      </p>

      <LegalSection title="Contact Information">
        <div className="space-y-4">
          <p className="font-medium text-fg">DECCAN AI labs Support Team</p>
          <p>
            <span className="text-fg">Phone: </span>
            <a href="tel:+916303207231" className="hover:text-accent transition">
              +91 63032 07231
            </a>
          </p>
          <p>
            <span className="text-fg">Email: </span>
            <a
              href="mailto:deccanailabs212@gmail.com"
              className="hover:text-accent transition"
            >
              deccanailabs212@gmail.com
            </a>
          </p>
          <p>
            <span className="text-fg">Website: </span>
            <a
              href="https://deccanailabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition"
            >
              https://deccanailabs.com
            </a>
          </p>
        </div>
      </LegalSection>

      <p>
        For detailed inquiries, you can also visit our{" "}
        <Link to="/contact" className="text-accent hover:underline">
          Contact page
        </Link>{" "}
        and submit a message directly.
      </p>
    </LegalPageLayout>
  );
}

export default HelpSupportPage;
