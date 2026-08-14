import CoursesSection from "../components/CoursesSection";

function CoursesPage() {
  return (
    <>
      <section className="courses-page-hero">
        <div className="courses-page-glow" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <p className="theme-label mb-4">COURSES</p>
          <h1 className="courses-page-title text-fg">
            Choose a track.
            <span className="block text-accent">Register in four steps.</span>
          </h1>
          <p className="courses-page-sub text-muted">
            Six focused courses. Registration, payment details, verification,
            then your application ID is generated.
          </p>
        </div>
      </section>
      <CoursesSection showIntro={false} />
    </>
  );
}

export default CoursesPage;
