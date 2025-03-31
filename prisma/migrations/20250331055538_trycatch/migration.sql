BEGIN;

-- Step 1: Add new column "trigger" of type CampaignType with a default value
ALTER TABLE "Campaign"
  ADD COLUMN "trigger" "CampaignType" NOT NULL DEFAULT 'CHECKOUT_CREATED';

-- Step 2: Convert the existing "type" column from enum to text
ALTER TABLE "Campaign"
  ALTER COLUMN "type" TYPE TEXT USING "type"::text;

COMMIT;
