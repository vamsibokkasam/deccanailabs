function VisionMission() {
  return (
    <section className="theme-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="theme-label mb-4">OUR PURPOSE</p>
          <h2 className="theme-heading">Vision & Mission</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="theme-card theme-card-hover p-10">
            <h3 className="text-3xl font-medium text-fg mb-6">Vision</h3>
            <p className="text-muted leading-relaxed">
              To become a leading platform that empowers individuals
              through innovation, technology, and future-focused learning.
            </p>
          </div>

          <div className="theme-card theme-card-hover p-10">
            <h3 className="text-3xl font-medium text-fg mb-6">Mission</h3>
            <p className="text-muted leading-relaxed">
              To bridge the gap between education and industry through
              internships, skill development, and innovation programs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VisionMission;
