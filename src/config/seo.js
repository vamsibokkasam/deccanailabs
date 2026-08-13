import {
  KNOWN_COURSE_TITLES,
  resolveCourseTitle,
} from "../utils/courseSlug.js";
import { BRAND_LEGAL_NAME, SITE_LOGO_PATH } from "./branding.js";
import { ORGANIZATION_DESCRIPTION } from "./site.js";

export const SITE_NAME = BRAND_LEGAL_NAME;

export const SITE_TITLE = `${SITE_NAME} | Technology Courses, Internships & Training`;

export const OG_TITLE = SITE_NAME;

export const OG_IMAGE_PATH = SITE_LOGO_PATH;

export const TWITTER_CARD = "summary_large_image";

export const TWITTER_SITE = import.meta.env.VITE_TWITTER_SITE?.trim() || "";

export const DEFAULT_DESCRIPTION = ORGANIZATION_DESCRIPTION;

export const DEFAULT_KEYWORDS =
  "DECCAN AI LABS Private Limited, DECCAN AI LABS Pvt Ltd, DeccanAILabs, DECCAN AI LABS, Deccan AI Labs India, DeccanAILabs official website, technology education India, internships India, AI training, web development internship, Python course, Java course, data science, cyber security, skill development";

export function getOgImageUrl(siteUrl) {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${OG_IMAGE_PATH}`;
}

export function buildPageTitle(pageName) {
  if (!pageName) return SITE_TITLE;
  return `${pageName} | ${SITE_NAME}`;
}

const COURSE_DESCRIPTIONS = {
  "Python Development":
    "Apply for the Python Development internship at DECCAN AI LABS. Build real-world skills through projects, mentor support, and a 45-day hands-on program.",
  "Java Development":
    "Apply for the Java Development internship at DECCAN AI LABS. Gain industry-focused programming experience with real-time applications and expert guidance.",
  "Web Development":
    "Apply for the Web Development internship at DECCAN AI LABS. Learn HTML, CSS, JavaScript, and project-based skills with experienced mentors.",
  "AI & Machine Learning":
    "Apply for the AI & Machine Learning internship at DECCAN AI LABS. Explore practical AI concepts, projects, and real-world use cases over 45 days.",
  "Data Science":
    "Apply for the Data Science internship at DECCAN AI LABS. Learn data analysis, visualization, and problem-solving with industry-relevant datasets.",
  "Cyber Security":
    "Apply for the Cyber Security internship at DECCAN AI LABS. Study threat detection, security fundamentals, and practical cybersecurity skills.",
};

const COURSE_KEYWORDS = {
  "Python Development":
    "Python internship, Python development course, Python training, DECCAN AI LABS Python, programming internship India",
  "Java Development":
    "Java internship, Java development course, Java programming training, DECCAN AI LABS Java, software internship India",
  "Web Development":
    "web development internship, HTML CSS JavaScript, frontend internship, DECCAN AI LABS web development, website training",
  "AI & Machine Learning":
    "AI internship, machine learning course, artificial intelligence training, DECCAN AI LABS AI ML, AI projects India",
  "Data Science":
    "data science internship, data analysis course, data visualization training, DECCAN AI LABS data science, analytics internship",
  "Cyber Security":
    "cyber security internship, cybersecurity course, ethical hacking training, DECCAN AI LABS cyber security, security internship India",
};

const ROUTE_SEO = {
  "/": {
    title: SITE_TITLE,
    description: ORGANIZATION_DESCRIPTION,
    keywords:
      "DECCAN AI LABS Private Limited, DECCAN AI LABS Pvt Ltd, DeccanAILabs, DECCAN AI LABS, Deccan AI Labs India, DeccanAILabs official website, technology education India, internships India, AI training, web development internship, Python course, Java course, data science, cyber security, skill development",
  },
  "/about": {
    title: buildPageTitle("About Us"),
    description:
      "Learn about DECCAN AI LABS Private Limited — an India-incorporated technology education company offering internships, mentor-led training, and practical courses in AI, programming, and data science.",
    keywords:
      "about DECCAN AI LABS Private Limited, DECCAN AI LABS Pvt Ltd, DeccanAILabs, DECCAN AI LABS India, tech education India, AI internships, independent training company, professional development",
  },
  "/team": {
    title: buildPageTitle("Leadership Team"),
    description:
      "Meet the DECCAN AI LABS leadership team — visionary founders and directors building transformative learning experiences for students across India.",
    keywords:
      "DECCAN AI LABS leadership, founders, management team, tech education leaders, DECCAN AI LABS team",
  },
  "/programs": {
    title: buildPageTitle("Strategy & Programs"),
    description:
      "Explore DECCAN AI LABS strategic programs in technology education, AI, skill development, experiential learning, and digital transformation.",
    keywords:
      "technology programs, AI education, skill development programs, digital transformation training, DECCAN AI LABS strategy, learning programs India",
  },
  "/internships": {
    title: buildPageTitle("Internships"),
    description:
      "Browse DECCAN AI LABS internships in web development, Python, Java, AI, data science, and cyber security with real projects, mentors, and certificates.",
    keywords:
      "internships India, online internship, web development internship, Python internship, Java internship, AI internship, internship with certificate",
  },
  "/contact": {
    title: buildPageTitle("Contact"),
    description:
      "Get in touch with DECCAN AI LABS for internship applications, program enquiries, partnerships, certificates, and general support.",
    keywords:
      "contact DECCAN AI LABS, internship enquiry, program support, tech training contact, DECCAN AI LABS help, partnership enquiry",
  },
  "/privacy-policy": {
    title: buildPageTitle("Privacy Policy"),
    description:
      "Read how DECCAN AI LABS collects, uses, stores, and protects personal information for students, interns, applicants, and website visitors.",
    keywords:
      "DECCAN AI LABS privacy policy, data protection, user privacy, personal information policy, website privacy",
  },
  "/terms-and-conditions": {
    title: buildPageTitle("Terms and Conditions"),
    description:
      "Review DECCAN AI LABS terms and conditions for website use, internship applications, program participation, and user responsibilities.",
    keywords:
      "DECCAN AI LABS terms, terms and conditions, internship terms, website usage policy, program rules",
  },
  "/help-support": {
    title: buildPageTitle("Help & Support"),
    description:
      "Need help with DECCAN AI LABS? Find support for applications, certificates, technical issues, and program-related questions.",
    keywords:
      "DECCAN AI LABS support, help center, internship help, certificate help, student support",
  },
  "/admin": {
    title: buildPageTitle("Admin"),
    description: "Secure admin access for DECCAN AI LABS to manage applications, contacts, programs, and payments.",
    keywords: "DECCAN AI LABS admin",
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
        `Apply for the ${courseName} internship at DECCAN AI LABS. Complete registration with your details online.`,
      keywords:
        COURSE_KEYWORDS[courseName] ||
        `${courseName} internship, DECCAN AI LABS internship application, online internship apply`,
    });
  }

  if (pathname.startsWith("/verify/")) {
    return withDefaults({
      title: buildPageTitle("Verify Certificate"),
      description:
        "Verify a DECCAN AI LABS internship certificate and view official recipient and program details.",
      keywords:
        "verify internship certificate, DECCAN AI LABS certificate verification, certificate QR check",
      noindex: true,
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
