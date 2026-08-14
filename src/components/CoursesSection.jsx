import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { COURSES } from "../config/courses";
import ProgramIcon from "./ProgramIcon";
import Reveal from "./Reveal";

function CoursesSection({ showIntro = true }) {
  return (
    <section className={`courses-board ${showIntro ? "theme-section" : "courses-board--page"}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`courses-board-layout ${showIntro ? "" : "courses-board-layout--page"}`}>
          {showIntro ? (
            <Reveal className="courses-board-intro">
              <p className="theme-label mb-4">COURSES</p>
              <h2 className="theme-heading courses-board-title">
                Structured tracks you can register for
              </h2>
              <p className="mt-5 text-muted text-base md:text-lg leading-relaxed">
                Guided courses on the same subjects as our internships. Register
                in four steps: details, payment, verification, then your
                application ID.
              </p>
            </Reveal>
          ) : null}

          <ol className="courses-board-list">
            {COURSES.map((course, index) => (
              <li key={course.slug}>
                <Reveal delay={index * 40}>
                  <Link to={`/courses/${course.slug}`} className="courses-row">
                    <span className="courses-row-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="courses-row-icon" aria-hidden="true">
                      <ProgramIcon title={course.title} className="w-6 h-6" />
                    </span>
                    <span className="courses-row-copy">
                      <span className="courses-row-title">{course.title}</span>
                      <span className="courses-row-summary">{course.summary}</span>
                    </span>
                    <span className="course-soon-badge">Register</span>
                    <span className="courses-row-go" aria-hidden="true">
                      <ArrowUpRight size={18} />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default CoursesSection;
