function WhyChooseUs() {
  const features = [
    {
      title: "Industry-Oriented Learning",
      description:
        "Learn through programs designed to align with current industry requirements and emerging technologies.",
    },
    {
      title: "Practical Experience",
      description:
        "Gain hands-on exposure through projects, assignments, and real-world learning opportunities.",
    },
    {
      title: "Mentorship & Guidance",
      description:
        "Receive support from experienced mentors who help you build confidence and professional skills.",
    },
    {
      title: "Future-Ready Skills",
      description:
        "Develop technical and professional competencies that prepare you for future career opportunities.",
    },
  ];

  return (
    <section className="theme-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="theme-label mb-4">WHY CHOOSE US</p>
          <h2 className="theme-heading">Why Choose DECCAN AI labs?</h2>
          <p className="mt-6 text-lg text-muted max-w-3xl mx-auto">
            We focus on innovation, practical learning, mentorship,
            and industry-relevant experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="theme-card theme-card-hover p-8">
              <h3 className="text-2xl font-medium text-fg mb-4">
                {feature.title}
              </h3>
              <p className="text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
