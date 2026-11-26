-- Program can offer multiple internship duration options; students pick one.
ALTER TABLE "programs"
  ADD COLUMN IF NOT EXISTS "durations" TEXT[] NOT NULL DEFAULT ARRAY['45 Days']::TEXT[];

UPDATE "programs"
SET "durations" = ARRAY[NULLIF(BTRIM("duration"), '')]::TEXT[]
WHERE (
  "durations" IS NULL
  OR cardinality("durations") = 0
)
AND NULLIF(BTRIM("duration"), '') IS NOT NULL;

UPDATE "programs"
SET "durations" = ARRAY['45 Days']::TEXT[]
WHERE "durations" IS NULL OR cardinality("durations") = 0;

UPDATE "programs"
SET "duration" = array_to_string("durations", ' / ')
WHERE "duration" IS NULL OR BTRIM("duration") = '';

ALTER TABLE "internship_applications"
  ADD COLUMN IF NOT EXISTS "selectedDuration" TEXT;
