function FocusAreas() {
  const areas = [
    {
      title: "Artificial Intelligence & Intelligent Systems",
      description:
        "Driving awareness, adoption, and application of AI-powered technologies across learning and innovation ecosystems.",
    },
    {
      title: "Technology Education & Skill Development",
      description:
        "Delivering structured learning experiences that equip individuals with practical and industry-relevant competencies.",
    },
    {
      title: "Internship & Experiential Learning",
      description:
        "Creating opportunities for learners to gain hands-on exposure, real-world experience, and professional confidence.",
    },
    {
      title: "Innovation & Digital Transformation",
      description:
        "Supporting the development of innovative solutions that address modern challenges and accelerate growth.",
    },
  ];

  return (
    <section className="theme-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="theme-label tracking-wider mb-4">
            STRATEGIC FOCUS AREAS
          </p>
          <h2 className="theme-heading">What We Focus On</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {areas.map((area, index) => (
            <div key={index} className="theme-card theme-card-hover p-8">
              <h3 className="text-2xl font-medium text-fg mb-4">
                {area.title}
              </h3>
              <p className="text-muted leading-relaxed">
                {area.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FocusAreas;
