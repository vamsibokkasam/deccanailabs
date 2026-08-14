import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { COURSES, getCourseBySlug } from "../config/courses";
import ProgramIcon from "../components/ProgramIcon";
import Reveal from "../components/Reveal";

function CourseDetailsPage() {
  const { slug } = useParams();
  const course = getCourseBySlug(slug);

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  const others = COURSES.filter((item) => item.slug !== course.slug);

  return (
    <>
      <section className="course-details-hero">
        <div className="course-details-glow" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link to="/courses" className="course-back">
            <ArrowLeft size={16} aria-hidden="true" />
            All courses
          </Link>

          <div className="course-details-head">
            <div className="internship-icon course-details-icon">
              <ProgramIcon title={course.title} className="w-9 h-9" />
            </div>
            <div>
              <p className="theme-label mb-3">COURSE</p>
              <h1 className="course-details-title text-fg">{course.title}</h1>
              <p className="course-details-lead text-muted">{course.overview}</p>
              <div className="course-details-pills">
                <span className="course-pill">Mentor-led</span>
                <span className="course-pill">Project-based</span>
                <span className="course-pill">Four-step registration</span>
              </div>
              <Link
                to={`/courses/${course.slug}/register`}
                className="theme-btn-primary course-details-register inline-flex items-center justify-center gap-2 px-6 py-3"
              >
                Register Now
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="theme-section course-details-body">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] gap-6 md:gap-8">
            <Reveal className="theme-card p-7 md:p-9">
              <h2 className="text-xl md:text-2xl font-semibold text-fg mb-5">
                What you will learn
              </h2>
              <ul className="course-learn-list">
                {course.learn.map((item) => (
                  <li key={item}>
                    <span className="course-learn-check" aria-hidden="true">
                      <Check size={14} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="theme-card p-7 md:p-9" delay={80}>
              <h2 className="text-xl md:text-2xl font-semibold text-fg mb-5">
                Who it is for
              </h2>
              <ul className="space-y-3 text-muted leading-relaxed">
                {course.audience.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="course-dot" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal className="course-details-cta theme-card mt-8 p-7 md:p-9">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="theme-label mb-2">ENROLLMENT</p>
                <h2 className="text-xl md:text-2xl font-semibold text-fg mb-2">
                  Register for {course.title}
                </h2>
                <p className="text-muted max-w-xl leading-relaxed">
                  Complete registration, payment details, and verification. Your
                  application ID is generated at the end.
                </p>
              </div>
              <Link
                to={`/courses/${course.slug}/register`}
                className="theme-btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 shrink-0"
              >
                Register Now
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          {others.length ? (
            <Reveal className="more-courses mt-14">
              <p className="theme-label mb-7">MORE COURSES</p>
              <div className="more-courses-grid">
                {others.map((item, index) => (
                  <Link
                    key={item.slug}
                    to={`/courses/${item.slug}`}
                    className="more-course-card"
                  >
                    <span className="more-course-top">
                      <span className="more-course-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="course-soon-badge">Register</span>
                    </span>
                    <h3 className="more-course-title">{item.title}</h3>
                    <p className="more-course-copy">{item.summary}</p>
                    <span className="more-course-link">
                      View track
                      <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          ) : null}
        </div>
      </section>
    </>
  );
}

export default CourseDetailsPage;
