import {
  KNOWN_COURSE_TITLES,
  resolveCourseTitle,
} from "../utils/courseSlug.js";
import { SITE_LOGO_PATH } from "./branding.js";

export const SITE_TITLE = "DeccanAILabs | Technology Courses, Internships & Training";

export const OG_TITLE = "DeccanAILabs";

export const OG_IMAGE_PATH = SITE_LOGO_PATH;

export const TWITTER_CARD = "summary_large_image";

export const TWITTER_SITE = import.meta.env.VITE_TWITTER_SITE?.trim() || "";

export const DEFAULT_DESCRIPTION =
  "DECCAN AI labs offers technology courses, industry-focused internships, and hands-on training in AI, web development, Python, Java, data science, cyber security, and more.";

export const DEFAULT_KEYWORDS =
  "DECCAN AI labs, DeccanAILabs, technology courses, internships, skill development, AI training, web development, Python, Java, data science, cyber security, online internships India, tech education";

export function getOgImageUrl(siteUrl) {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${OG_IMAGE_PATH}`;
}

export function buildPageTitle(pageName) {
  if (!pageName) return SITE_TITLE;
  return `${pageName} | ${SITE_TITLE}`;
}

const COURSE_DESCRIPTIONS = {
  "Python Development":
    "Apply for the Python Development internship at DECCAN AI labs. Build real-world skills through projects, mentor support, and a 45-day hands-on program.",
  "Java Development":
    "Apply for the Java Development internship at DECCAN AI labs. Gain industry-focused programming experience with real-time applications and expert guidance.",
  "Web Development":
    "Apply for the Web Development internship at DECCAN AI labs. Learn HTML, CSS, JavaScript, and project-based skills with experienced mentors.",
  "AI & Machine Learning":
    "Apply for the AI & Machine Learning internship at DECCAN AI labs. Explore practical AI concepts, projects, and real-world use cases over 45 days.",
  "Data Science":
    "Apply for the Data Science internship at DECCAN AI labs. Learn data analysis, visualization, and problem-solving with industry-relevant datasets.",
  "Cyber Security":
    "Apply for the Cyber Security internship at DECCAN AI labs. Study threat detection, security fundamentals, and practical cybersecurity skills.",
};

const COURSE_KEYWORDS = {
  "Python Development":
    "Python internship, Python development course, Python training, DECCAN AI labs Python, programming internship India",
  "Java Development":
    "Java internship, Java development course, Java programming training, DECCAN AI labs Java, software internship India",
  "Web Development":
    "web development internship, HTML CSS JavaScript, frontend internship, DECCAN AI labs web development, website training",
  "AI & Machine Learning":
    "AI internship, machine learning course, artificial intelligence training, DECCAN AI labs AI ML, AI projects India",
  "Data Science":
    "data science internship, data analysis course, data visualization training, DECCAN AI labs data science, analytics internship",
  "Cyber Security":
    "cyber security internship, cybersecurity course, ethical hacking training, DECCAN AI labs cyber security, security internship India",
};

const ROUTE_SEO = {
  "/": {
    title: SITE_TITLE,
    description:
      "Join DECCAN AI labs for technology courses, internships, and industry training in AI, web development, Python, Java, data science, cyber security, and more.",
    keywords:
      "DECCAN AI labs, technology courses, internships India, AI training, web development internship, Python course, Java course, data science, cyber security, skill development",
  },
  "/about": {
    title: buildPageTitle("About Us"),
    description:
      "Discover DECCAN AI labs — a technology-driven platform bridging education and industry through innovation, internships, mentorship, and skill development.",
    keywords:
      "about DECCAN AI labs, tech education India, AI innovation, industry training, professional development, education technology company",
  },
  "/team": {
    title: buildPageTitle("Leadership Team"),
    description:
      "Meet the DECCAN AI labs leadership team — visionary founders and directors building transformative learning experiences for students across India.",
    keywords:
      "DECCAN AI labs leadership, founders, management team, tech education leaders, DECCAN AI labs team",
  },
  "/programs": {
    title: buildPageTitle("Strategy & Programs"),
    description:
      "Explore DECCAN AI labs strategic programs in technology education, AI, skill development, experiential learning, and digital transformation.",
    keywords:
      "technology programs, AI education, skill development programs, digital transformation training, DECCAN AI labs strategy, learning programs India",
  },
  "/internships": {
    title: buildPageTitle("Internships"),
    description:
      "Browse DECCAN AI labs internships in web development, Python, Java, AI, data science, and cyber security with real projects, mentors, and certificates.",
    keywords:
      "internships India, online internship, paid internship, web development internship, Python internship, Java internship, AI internship, internship with certificate",
  },
  "/contact": {
    title: buildPageTitle("Contact"),
    description:
      "Get in touch with DECCAN AI labs for internship applications, program enquiries, partnerships, certificates, payments, and general support.",
    keywords:
      "contact DECCAN AI labs, internship enquiry, program support, tech training contact, DECCAN AI labs help, partnership enquiry",
  },
  "/privacy-policy": {
    title: buildPageTitle("Privacy Policy"),
    description:
      "Read how DECCAN AI labs collects, uses, stores, and protects personal information for students, interns, applicants, and website visitors.",
    keywords:
      "DECCAN AI labs privacy policy, data protection, user privacy, personal information policy, website privacy",
  },
  "/terms-and-conditions": {
    title: buildPageTitle("Terms and Conditions"),
    description:
      "Review DECCAN AI labs terms and conditions for website use, internship applications, program participation, and user responsibilities.",
    keywords:
      "DECCAN AI labs terms, terms and conditions, internship terms, website usage policy, program rules",
  },
  "/help-support": {
    title: buildPageTitle("Help & Support"),
    description:
      "Need help with DECCAN AI labs? Find support for applications, payments, certificates, technical issues, and program-related questions.",
    keywords:
      "DECCAN AI labs support, help center, internship help, payment support, certificate help, student support",
  },
  "/admin": {
    title: buildPageTitle("Admin"),
    description: "Secure admin access for DECCAN AI labs to manage applications, contacts, programs, and payments.",
    keywords: "DECCAN AI labs admin",
    noindex: true,
  },
};

export function getSeoForPath(pathname) {
  const applicationMatch = pathname.match(/^\/internship\/apply\/(.+)$/);

  if (applicationMatch) {
    const courseName = resolveCourseTitle(applicationMatch[1], KNOWN_COURSE_TITLES);
    return withDefaults({
      title: buildPageTitle(`${courseName} Internship Application`),
      description:
        COURSE_DESCRIPTIONS[courseName] ||
        `Apply for the ${courseName} internship at DECCAN AI labs. Complete registration, payment, and verification online.`,
      keywords:
        COURSE_KEYWORDS[courseName] ||
        `${courseName} internship, DECCAN AI labs internship application, online internship apply`,
    });
  }

  if (ROUTE_SEO[pathname]) {
    return withDefaults(ROUTE_SEO[pathname]);
  }

  return withDefaults({
    title: SITE_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
  });
}

function withDefaults({ title, description, keywords, noindex = false }) {
  return {
    title: title || SITE_TITLE,
    description: description || DEFAULT_DESCRIPTION,
    keywords: keywords || DEFAULT_KEYWORDS,
    noindex,
  };
}
