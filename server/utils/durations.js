const DEFAULT_DURATION = "45 Days";

export function normalizeDurations(input, fallbackDuration = DEFAULT_DURATION) {
  let values = [];

  if (Array.isArray(input)) {
    values = input;
  } else if (typeof input === "string" && input.trim()) {
    values = input.split(/[,|/]/).map((part) => part.trim());
  }

  const unique = [];
  for (const value of values) {
    const trimmed = String(value || "").trim().slice(0, 50);
    if (!trimmed) continue;
    if (unique.some((item) => item.toLowerCase() === trimmed.toLowerCase())) continue;
    unique.push(trimmed);
  }

  if (unique.length === 0) {
    const fallback = String(fallbackDuration || "").trim().slice(0, 50);
    return fallback ? [fallback] : [DEFAULT_DURATION];
  }

  return unique;
}

export function displayDuration(durations, fallbackDuration = DEFAULT_DURATION) {
  return normalizeDurations(durations, fallbackDuration).join(" / ");
}

export function resolveSelectedDuration(selectedDuration, durations, fallbackDuration = DEFAULT_DURATION) {
  const options = normalizeDurations(durations, fallbackDuration);
  const selected = String(selectedDuration || "").trim();

  if (selected) {
    const match = options.find((option) => option.toLowerCase() === selected.toLowerCase());
    if (match) return match;
  }

  return options[0] || DEFAULT_DURATION;
}

export { DEFAULT_DURATION };
