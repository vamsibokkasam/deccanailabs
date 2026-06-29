import LegalPageLayout, { LegalList, LegalSection } from "../components/LegalPageLayout";

function TermsPage() {
  return (
    <LegalPageLayout label="LEGAL" title="Terms and Conditions">
      <p>
        By accessing, browsing, or utilizing this website and its associated
        services, you acknowledge that you have read, understood, and agreed to
        be bound by the following Terms and Conditions.
      </p>

      <LegalSection title="1. Acceptance of Terms">
        <p>
          Your access to and use of the DECCAN AI labs website constitutes
          acceptance of these Terms and Conditions and all applicable laws and
          regulations.
        </p>
      </LegalSection>

      <LegalSection title="2. Purpose of the Website">
        <p>
          The website is intended to provide information regarding our
          organization, internship programs, training initiatives, technology
          services, and professional development opportunities.
        </p>
      </LegalSection>

      <LegalSection title="3. User Responsibilities">
        <p>Users agree to:</p>
        <LegalList
          items={[
            "Provide accurate and complete information when submitting applications or inquiries",
            "Use the website in a lawful and ethical manner",
            "Refrain from any activity that may disrupt, damage, or compromise website functionality",
            "Respect the intellectual property rights of DECCAN AI labs",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Internship Applications">
        <LegalList
          items={[
            "Submission of an application does not guarantee internship selection, placement, certification, employment, or future opportunities",
            "DECCAN AI labs reserves the right to review, shortlist, approve, reject, suspend, or terminate applications based on organizational requirements and eligibility criteria",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Intellectual Property Rights">
        <p>
          All content available on this website, including but not limited to
          text, graphics, logos, designs, documents, branding elements, and
          digital assets, shall remain the exclusive property of DECCAN AI labs
          unless otherwise stated.
        </p>
        <p>
          Unauthorized reproduction, modification, distribution, or commercial
          use of any content is strictly prohibited.
        </p>
      </LegalSection>

      <LegalSection title="6. Professional Conduct">
        <p>
          Participants associated with DECCAN AI labs programs are expected to
          maintain professionalism, ethical behavior, confidentiality, and
          respect throughout their engagement with the organization.
        </p>
        <p>
          Any misconduct, misrepresentation, plagiarism, or violation of
          organizational policies may result in immediate termination from the
          program.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitation of Liability">
        <p>
          DECCAN AI labs shall not be held liable for any direct, indirect,
          incidental, consequential, or special damages arising from the use of
          this website, participation in programs, or reliance on information
          provided herein.
        </p>
      </LegalSection>

      <LegalSection title="8. Accuracy of Information">
        <p>
          While every effort is made to ensure the accuracy and reliability of
          information presented on this website, DECCAN AI labs does not warrant
          that all content is complete, current, or error-free.
        </p>
      </LegalSection>

      <LegalSection title="9. Privacy and Data Protection">
        <p>
          User information shall be collected, processed, and protected in
          accordance with the DECCAN AI labs Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection title="10. Modifications and Updates">
        <p>
          DECCAN AI labs reserves the right to modify, update, suspend, or
          discontinue any portion of the website, services, policies, or
          programs without prior notice.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing Principles">
        <p>
          These Terms and Conditions shall be interpreted in accordance with
          applicable laws and principles governing business operations and
          digital services.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

export default TermsPage;
