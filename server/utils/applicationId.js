import InternshipApplication from "../models/InternshipApplication.js";
import SequenceCounter from "../models/SequenceCounter.js";

const ID_PREFIX = "DCAL";
const COUNTER_KEY = "applicationId";
const MAX_SEQUENCE = 26 * 999;
const APPLICATION_ID_PATTERN = /^DCAL-(\d{8})-([A-Z]\d{3})$/;

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

export function parseSequenceSuffix(suffix) {
  const match = suffix.match(/^([A-Z])(\d{3})$/);
  if (!match) return 0;

  const letterIndex = match[1].charCodeAt(0) - 65;
  const numberPart = parseInt(match[2], 10);

  return letterIndex * 999 + numberPart;
}

export function parseApplicationId(applicationId) {
  const match = applicationId?.match(APPLICATION_ID_PATTERN);
  if (!match) return null;

  return {
    datePart: match[1],
    suffix: match[2],
    sequence: parseSequenceSuffix(match[2]),
  };
}

export function compareApplicationIds(leftId, rightId) {
  const left = parseApplicationId(leftId);
  const right = parseApplicationId(rightId);

  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;

  return right.sequence - left.sequence;
}

async function getMaxExistingSequence(session = null) {
  const query = InternshipApplication.find({
    applicationId: APPLICATION_ID_PATTERN,
  })
    .select("applicationId")
    .lean();

  if (session) query.session(session);

  const applications = await query;
  let maxSequence = 0;

  for (const { applicationId } of applications) {
    const parsed = parseApplicationId(applicationId);
    if (parsed) {
      maxSequence = Math.max(maxSequence, parsed.sequence);
    }
  }

  return maxSequence;
}

async function ensureGlobalCounter(session = null) {
  const query = SequenceCounter.findOne({ key: COUNTER_KEY });
  if (session) query.session(session);

  const existing = await query.lean();
  if (existing) return;

  const maxSequence = await getMaxExistingSequence(session);

  try {
    await SequenceCounter.create([{ key: COUNTER_KEY, value: maxSequence }], { session });
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }
  }
}

export async function generateApplicationId(session = null) {
  await ensureGlobalCounter(session);

  const options = { returnDocument: "after", upsert: true };
  if (session) options.session = session;

  const counter = await SequenceCounter.findOneAndUpdate(
    { key: COUNTER_KEY },
    { $inc: { value: 1 } },
    options
  );

  if (!counter || counter.value > MAX_SEQUENCE) {
    throw new Error("Application ID limit reached.");
  }

  const datePart = formatDatePart();
  const suffix = formatSequence(counter.value);

  return `${ID_PREFIX}-${datePart}-${suffix}`;
}
