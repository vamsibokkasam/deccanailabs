export function courseTitleToSlug(title) {
  return String(title)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveCourseTitle(param, knownTitles = []) {
  if (!param) return "";

  const decoded = decodeURIComponent(param).replace(/\+/g, " ");
  const normalizedParam = param.trim().toLowerCase();

  if (knownTitles.includes(decoded)) {
    return decoded;
  }

  const bySlug = knownTitles.find((title) => courseTitleToSlug(title) === normalizedParam);
  if (bySlug) {
    return bySlug;
  }

  if (knownTitles.includes(param)) {
    return param;
  }

  return decoded
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const KNOWN_COURSE_TITLES = [
  "Python Development",
  "Java Development",
  "Web Development",
  "AI & Machine Learning",
  "Data Science",
  "Cyber Security",
];
