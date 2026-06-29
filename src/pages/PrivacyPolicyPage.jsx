import LegalPageLayout, { LegalList, LegalSection } from "../components/LegalPageLayout";

function PrivacyPolicyPage() {
  return (
    <LegalPageLayout label="LEGAL" title="Privacy Policy">
      <p>
        At DECCAN AI labs, we value the privacy of our students, interns,
        website visitors, and users. This Privacy Policy explains how we
        collect, use, and protect your information when you visit our website
        or participate in our programs.
      </p>

      <LegalSection title="1. Information We Collect">
        <p>We may collect the following information:</p>
        <LegalList
          items={[
            "Full Name",
            "Email Address",
            "Phone Number",
            "Educational Details",
            "Resume/CV",
            "Internship Application Information",
            "Any information voluntarily submitted through forms",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. How We Use Information">
        <p>The information collected may be used to:</p>
        <LegalList
          items={[
            "Process internship applications",
            "Communicate with applicants and interns",
            "Issue offer letters and certificates",
            "Provide training and learning resources",
            "Improve our services and website experience",
            "Maintain program records",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Data Protection">
        <p>
          DECCAN AI labs takes reasonable measures to protect user information
          from unauthorized access, misuse, or disclosure.
        </p>
      </LegalSection>

      <LegalSection title="4. Information Sharing">
        <p>
          We do not sell, rent, or trade personal information to third parties.
          Information may only be shared when required by law or with authorized
          educational and training partners.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies">
        <p>
          Our website may use cookies and analytics tools to improve user
          experience and website performance.
        </p>
      </LegalSection>

      <LegalSection title="6. Third-Party Links">
        <p>
          Our website may contain links to external websites. We are not
          responsible for the privacy practices of those websites.
        </p>
      </LegalSection>

      <LegalSection title="7. Internship Applications">
        <p>
          Submission of an internship application does not guarantee selection.
          DECCAN AI labs reserves the right to accept or reject applications
          based on program requirements.
        </p>
      </LegalSection>

      <LegalSection title="8. Updates to This Policy">
        <p>
          We may update this Privacy Policy periodically. Any changes will be
          published on this page.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

export default PrivacyPolicyPage;
