function Framework() {
  const steps = [
    {
      title: "Learn",
      description:
        "Acquire knowledge through structured learning and guided mentorship.",
    },
    {
      title: "Innovate",
      description:
        "Apply creativity and critical thinking to solve real-world challenges.",
    },
    {
      title: "Execute",
      description:
        "Transform ideas into practical solutions through projects and implementation.",
    },
    {
      title: "Lead",
      description:
        "Develop confidence, competence, and leadership for future success.",
    },
  ];

  return (
    <section className="theme-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="theme-label mb-4">OUR FRAMEWORK</p>
          <h2 className="theme-heading">Learn. Innovate. Execute. Lead.</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="theme-card theme-card-hover p-8"
            >
              <div className="text-5xl font-medium text-accent mb-6">
                0{index + 1}
              </div>

              <h3 className="text-2xl font-medium text-fg mb-4">
                {step.title}
              </h3>

              <p className="text-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Framework;
