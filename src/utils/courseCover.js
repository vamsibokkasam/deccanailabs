const NAMED_COVERS = [
  { match: /javascript|\bweb\b|frontend|front-end/i, src: "/courses/web.jpg?v=2" },
  { match: /python/i, src: "/courses/python.jpg?v=2" },
  { match: /\bjava\b/i, src: "/courses/java.jpg?v=2" },
  { match: /\bai\b|machine learning|\bml\b/i, src: "/courses/ai.jpg" },
  { match: /data/i, src: "/courses/data.jpg" },
  { match: /cyber|security/i, src: "/courses/cyber.jpg" },
];

const ACCENTS = ["#3fd0ff", "#2563ff", "#5b95ff", "#7adfff", "#8eb6ff"];

function hashName(name) {
  let hash = 0;
  for (const char of name.toLowerCase()) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(name) {
  const words = name.trim().split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > 22 && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function coverFromName(name) {
  const hash = hashName(name);
  const primary = ACCENTS[hash % ACCENTS.length];
  const secondary = ACCENTS[(hash >>> 3) % ACCENTS.length];
  const x1 = 120 + (hash % 820);
  const y1 = 40 + ((hash >>> 5) % 260);
  const x2 = 280 + ((hash >>> 9) % 860);
  const y2 = 180 + ((hash >>> 14) % 360);
  const lines = wrapTitle(name);
  const title = lines
    .map(
      (line, index) =>
        `<text x="72" y="${430 + index * 68}" fill="#f3f6ff" font-family="Montserrat, Segoe UI, sans-serif" font-size="56" font-weight="700">${escapeXml(line)}</text>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
    <rect width="1280" height="720" fill="#010f34"/>
    <circle cx="${x1}" cy="${y1}" r="240" fill="${primary}" opacity="0.38"/>
    <circle cx="${x2}" cy="${y2}" r="190" fill="${secondary}" opacity="0.3"/>
    <text x="72" y="118" fill="#3fd0ff" font-family="JetBrains Mono, ui-monospace, sans-serif" font-size="28" letter-spacing="6">INTERNSHIP</text>
    ${title}
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function courseCover(title = "") {
  const name = String(title || "").trim();
  if (!name) return "";
  const known = NAMED_COVERS.find(({ match }) => match.test(name));
  return known ? known.src : coverFromName(name);
}
