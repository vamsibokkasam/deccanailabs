function About() {
  return (
    <section className="theme-section">
      <div className="max-w-7xl mx-auto">
        <div className="theme-card rounded-3xl p-10 md:p-16">
          <p className="theme-label mb-4">ABOUT US</p>

          <h2 className="theme-heading mb-8">About Us</h2>

          <p className="text-lg text-muted leading-relaxed">
            Deccan AI Labs is a technology-driven organization dedicated to
            advancing innovation, developing future-ready talent, and creating
            impactful learning ecosystems through Artificial Intelligence,
            emerging technologies, and industry-integrated professional
            development.
          </p>

          <p className="mt-6 text-lg text-muted leading-relaxed">
            Founded with the vision of bridging the gap between education and
            industry, Deccan AI Labs serves as a catalyst for transformation by
            empowering individuals and organizations with the knowledge, skills,
            and opportunities required to thrive in a rapidly evolving digital
            world.
          </p>

          <p className="mt-6 text-lg text-fg font-medium leading-relaxed">
            We believe that the future belongs to those who continuously learn,
            innovate, and adapt.
          </p>
        </div>

        <div className="theme-card rounded-3xl p-8 md:p-12 mt-12">
          <p className="theme-label mb-4">LEADERSHIP</p>
          <h3 className="text-2xl md:text-3xl font-medium text-fg mb-10">
            Meet Our Founder
          </h3>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            <div className="shrink-0">
              <img
                src="/1000354279.jpg"
                alt="B. Vamsi — CEO & Founder of Deccan AI Labs"
                className="w-56 h-56 md:w-64 md:h-64 object-cover object-top rounded-2xl border border-border shadow-xl"
              />
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-2xl font-medium text-fg">B. Vamsi</h4>
              <p className="text-accent font-bold mt-1">
                CEO & Founder
              </p>
              <p className="text-muted text-sm mt-1">Deccan AI Labs</p>
              <p className="text-muted leading-relaxed mt-6 max-w-xl">
                Leading Deccan AI Labs with a vision to bridge education and
                industry through AI-driven innovation, hands-on internships, and
                programs that prepare learners for real-world success.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
