import { courseTitleToSlug } from "../utils/courseSlug";

/**
 * Structured course catalog. Same tracks as internships, lighter than
 * a full academy syllabus — honest for a program that is still launching.
 */
export const COURSES = [
  {
    title: "Web Development",
    summary:
      "Learn modern web development with HTML, CSS, JavaScript, and project-based learning guided by experienced mentors.",
    overview:
      "A practical introduction to building websites and web apps. You will work through the core frontend stack and finish with guided projects you can show in a portfolio.",
    audience: [
      "Students starting web development",
      "Beginners who want structured, project-based practice",
      "Anyone preparing for internship-ready frontend skills",
    ],
    learn: [
      "HTML, CSS, and responsive layouts",
      "JavaScript fundamentals for interactive pages",
      "Building small real-world web projects",
      "Clean structure, debugging, and mentor feedback",
    ],
  },
  {
    title: "Java Development",
    summary:
      "Build strong Java programming skills, work on real-time applications, and gain industry-focused development experience.",
    overview:
      "A focused Java track for learners who want programming depth and application practice — not a long list of extra modules we are not delivering yet.",
    audience: [
      "Computer science and IT students",
      "Beginners who want a strong Java foundation",
      "Learners aiming for backend-oriented internships",
    ],
    learn: [
      "Core Java and object-oriented programming",
      "Writing clean, readable application code",
      "Working on guided real-time mini applications",
      "Problem-solving with mentor support",
    ],
  },
  {
    title: "Python Development",
    summary:
      "Learn Python through practical projects, mentor guidance, and hands-on experience that prepares you for real roles.",
    overview:
      "Python from first programs to useful projects. The emphasis is practice, readable code, and confidence — not an inflated syllabus.",
    audience: [
      "Beginners new to programming",
      "Students who want Python for internships and projects",
      "Learners exploring automation or data paths later",
    ],
    learn: [
      "Python syntax, data types, and control flow",
      "Functions, modules, and structured scripts",
      "Hands-on mini projects with mentor review",
      "Habits that transfer to internships and coursework",
    ],
  },
  {
    title: "AI & Machine Learning",
    summary:
      "Explore AI fundamentals, build ML models, and apply intelligent systems through guided internship projects.",
    overview:
      "An introductory AI and machine learning course built around concepts you can actually apply. We keep the scope tight while the program is launching.",
    audience: [
      "Students curious about AI and ML",
      "Learners with basic programming interest",
      "Anyone who wants fundamentals before advanced research",
    ],
    learn: [
      "Core AI and machine learning ideas",
      "How models learn from data",
      "Simple, guided ML experiments",
      "Applying concepts to small real-world use cases",
    ],
  },
  {
    title: "Data Science",
    summary:
      "Work with real datasets, analysis workflows, and visualization projects to build job-ready data skills.",
    overview:
      "Learn how to explore data, find patterns, and present findings. The course stays practical: datasets, analysis, and clear visuals.",
    audience: [
      "Students interested in analytics",
      "Beginners who want structured data practice",
      "Learners preparing for data-focused internships",
    ],
    learn: [
      "Working with real datasets",
      "Analysis workflows and problem-solving",
      "Visualization that communicates insights",
      "Project practice with mentor feedback",
    ],
  },
  {
    title: "Cyber Security",
    summary:
      "Learn security fundamentals, practical threat awareness, and defensive techniques through structured modules.",
    overview:
      "A foundations course in cyber security: how threats work, what to watch for, and how to think defensively. We do not overclaim advanced hacking tracks we are not running yet.",
    audience: [
      "Students exploring security as a career path",
      "Beginners who want threat awareness and basics",
      "Learners who want structured, ethical fundamentals",
    ],
    learn: [
      "Security fundamentals and common threat types",
      "Practical awareness of how attacks typically work",
      "Defensive thinking and safe practices",
      "Guided modules with mentor support",
    ],
  },
].map((course) => ({
  ...course,
  slug: courseTitleToSlug(course.title),
  status: "open",
}));

export function getCourseBySlug(slug) {
  const normalized = String(slug || "")
    .trim()
    .toLowerCase();
  return COURSES.find((course) => course.slug === normalized) || null;
}
