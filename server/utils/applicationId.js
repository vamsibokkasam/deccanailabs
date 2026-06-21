import InternshipApplication from "../models/InternshipApplication.js";

const ID_PREFIX = "DCAL";
const MAX_DAILY_SEQUENCE = 26 * 999;

function formatDatePart(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}${mm}${yyyy}`;
}

function formatSequence(sequenceNumber) {
  const index = sequenceNumber - 1;
  const letterIndex = Math.floor(index / 999);
  const numberPart = (index % 999) + 1;

  if (letterIndex > 25) {
    throw new Error("Daily application ID limit reached.");
  }

  const letter = String.fromCharCode(65 + letterIndex);
  return `${letter}${String(numberPart).padStart(3, "0")}`;
}

function parseSequenceSuffix(suffix) {
  const match = suffix.match(/^([A-Z])(\d{3})$/);
  if (!match) return 0;

  const letterIndex = match[1].charCodeAt(0) - 65;
  const numberPart = parseInt(match[2], 10);

  return letterIndex * 999 + numberPart;
}

export async function generateApplicationId() {
  const datePart = formatDatePart();
  const idPrefix = `${ID_PREFIX}-${datePart}-`;

  const latest = await InternshipApplication.findOne({
    applicationId: new RegExp(`^${ID_PREFIX}-${datePart}-[A-Z]\\d{3}$`),
  })
    .sort({ applicationId: -1 })
    .select("applicationId")
    .lean();

  let nextSequence = 1;
  if (latest?.applicationId) {
    const suffix = latest.applicationId.slice(idPrefix.length);
    nextSequence = parseSequenceSuffix(suffix) + 1;
  }

  if (nextSequence > MAX_DAILY_SEQUENCE) {
    throw new Error("Daily application ID limit reached.");
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = formatSequence(nextSequence + attempt);
    const applicationId = `${idPrefix}${suffix}`;
    const exists = await InternshipApplication.exists({ applicationId });

    if (!exists) {
      return applicationId;
    }
  }

  throw new Error("Unable to generate application ID. Please try again.");
}
