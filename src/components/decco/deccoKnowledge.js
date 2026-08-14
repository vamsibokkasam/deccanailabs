import { BRAND_FAQ, ORGANIZATION_DESCRIPTION, ORGANIZATION_LOCATION } from "../../config/site";
import { BRAND_LEGAL_NAME, ORGANIZATION_GSTIN } from "../../config/branding";

const STOP = new Set([
  "a", "an", "the", "is", "are", "was", "were", "of", "in", "on", "to", "for",
  "and", "or", "do", "you", "your", "me", "my", "we", "i", "it", "this", "that",
  "with", "about", "can", "please", "tell", "what", "who", "where", "how",
  "when", "why", "any", "some", "from",
]);

const PROGRAMS =
  "AI & Machine Learning, Data Science, Web Development, Python Development, Java Development, and Cyber Security";

/** Extra company facts beyond the public FAQ list. */
const COMPANY_FACTS = [
  {
    keywords: ["deccanailabs", "deccan", "company", "about", "who", "what", "labs"],
    answer: ORGANIZATION_DESCRIPTION,
  },
  {
    keywords: ["experts", "affiliate", "affiliated", "same", "funding", "series", "startup"],
    answer:
      "No. DECCAN AI LABS Private Limited at deccanailabs.com is an independent education and internship company in India. We are not Deccan AI, not Deccan AI Experts, and not connected to any enterprise AI training-data company.",
  },
  {
    keywords: ["gst", "gstin", "gst number", "cin", "registered", "incorporation", "private", "limited", "legal"],
    answer: `Yes. ${BRAND_LEGAL_NAME} is incorporated in India (GST No. ${ORGANIZATION_GSTIN}). DeccanAILabs is the brand name of this registered private limited company.`,
  },
  {
    keywords: ["address", "location", "office", "where", "bengaluru", "bangalore", "nandini"],
    answer: `Our office is at ${ORGANIZATION_LOCATION}.`,
  },
  {
    keywords: ["email", "phone", "contact", "whatsapp", "call", "reach"],
    answer:
      "You can reach DECCAN AI LABS at careers@deccanailabs.com or +91 9845428526. WhatsApp is also available from the green button on this site.",
  },
  {
    keywords: ["website", "url", "site", "deccanailabs.com"],
    answer:
      "Our official website is https://deccanailabs.com — that’s the home of DECCAN AI LABS Private Limited (DeccanAILabs).",
  },
  {
    keywords: ["vision", "mission", "purpose", "goal"],
    answer:
      "Vision: become a leading platform that empowers people through innovation, technology, and future-focused learning. Mission: bridge education and industry through internships, skill development, and innovation programs.",
  },
  {
    keywords: ["apply", "join", "enroll", "admission", "register"],
    answer:
      "You can apply from the Internships page on deccanailabs.com. Choose a track, submit the form, and our team will guide you. Beginners are welcome.",
  },
  {
    keywords: ["internship", "internships", "program", "programs", "course", "courses"],
    answer: `We offer hands-on internships and courses in ${PROGRAMS}. Each path includes projects, mentor feedback, and certificates on eligible completions. Visit Internships to apply.`,
  },
  {
    keywords: ["msme", "ncs", "iso", "certified", "certification", "quality"],
    answer:
      "Yes. DECCAN AI LABS Private Limited is MSME, NCS, and ISO certified.",
  },
  {
    keywords: ["instagram", "linkedin", "social"],
    answer:
      "Follow us on Instagram @deccanailabs and LinkedIn at linkedin.com/in/deccanailabs.",
  },
  {
    keywords: ["decco", "mascot", "robot", "assistant", "who are you"],
    answer:
      "I’m Decco — a friendly little AI companion from Deccan AI Labs. I can help with internships, courses, certificates, and anything about the company.",
  },
];

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/deccan\s*ai\s*labs/g, "deccanailabs deccan labs")
    .replace(/deccanai/g, "deccanailabs deccan")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function scoreOverlap(queryTokens, targetTokens) {
  if (!queryTokens.length || !targetTokens.length) return 0;
  const set = new Set(targetTokens);
  let hits = 0;
  for (const t of queryTokens) {
    if (set.has(t)) hits += 1;
  }
  return hits;
}

/**
 * Answer a visitor question using DECCAN AI LABS site knowledge.
 * @param {string} message
 * @returns {string | null}
 */
export function answerFromKnowledge(message) {
  const raw = String(message || "").trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  const tokens = tokenize(raw);

  if (/^(hi|hello|hey|hai|yo|namaste)\b/.test(lower)) {
    return "Hi guys! I’m Decco from Deccan AI Labs. Ask me about internships, certificates, or how to apply — I’d love to help.";
  }

  if (/thanks|thank you|thx/.test(lower)) {
    return "You’re welcome! If you want to apply, open Internships on this site or email careers@deccanailabs.com.";
  }

  let best = { score: 0, answer: null };

  for (const item of BRAND_FAQ) {
    const qTokens = tokenize(item.question);
    const aTokens = tokenize(item.answer).slice(0, 24);
    const score =
      scoreOverlap(tokens, qTokens) * 3 + scoreOverlap(tokens, aTokens);
    if (score > best.score) best = { score, answer: item.answer };
  }

  for (const fact of COMPANY_FACTS) {
    const score = scoreOverlap(tokens, fact.keywords) * 4;
    if (score > best.score) best = { score, answer: fact.answer };
  }

  const mentionsBrand = /deccan|deccanai|deccanailabs|ai labs/.test(lower);
  if (mentionsBrand && best.score < 3) {
    return ORGANIZATION_DESCRIPTION;
  }

  if (best.score >= 2) return best.answer;
  return null;
}

export const SUGGESTED_PROMPTS = [
  "What is DECCAN AI LABS?",
  "What internships do you offer?",
  "Do you give certificates?",
  "How can I contact you?",
];
