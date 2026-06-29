import InternshipApplication from "../models/InternshipApplication.js";
import SequenceCounter from "../models/SequenceCounter.js";

const ID_PREFIX = "DCAL";
const COUNTER_KEY = "applicationId";
const MAX_SEQUENCE = 26 * 999;
const APPLICATION_ID_PATTERN = /^DCAL-\d{8}-[A-Z]\d{3}$/;

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
    throw new Error("Application ID limit reached.");
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

async function getMaxExistingSequence() {
  const applications = await InternshipApplication.find({
    applicationId: APPLICATION_ID_PATTERN,
  })
    .select("applicationId")
    .lean();

  let maxSequence = 0;

  for (const { applicationId } of applications) {
    const suffix = applicationId.split("-").pop();
    maxSequence = Math.max(maxSequence, parseSequenceSuffix(suffix));
  }

  return maxSequence;
}

async function ensureCounterInitialized() {
  const existing = await SequenceCounter.findOne({ key: COUNTER_KEY }).lean();
  if (existing) return;

  try {
    await SequenceCounter.create({ key: COUNTER_KEY, value: 0 });
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }
  }
}

export async function generateApplicationId() {
  await ensureCounterInitialized();

  const counter = await SequenceCounter.findOneAndUpdate(
    { key: COUNTER_KEY },
    { $inc: { value: 1 } },
    { new: true }
  );

  if (!counter || counter.value > MAX_SEQUENCE) {
    throw new Error("Application ID limit reached.");
  }

  const datePart = formatDatePart();
  const suffix = formatSequence(counter.value);

  return `${ID_PREFIX}-${datePart}-${suffix}`;
}
