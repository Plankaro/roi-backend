/*
  Warnings:

  - The values [AFTER_CAMPAIGN_CREATED] on the enum `campaign_trigger_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "campaign_trigger_type_new" AS ENUM ('AFTER_EVENT_CREATED', 'CUSTOM');
ALTER TABLE "Campaign" ALTER COLUMN "trigger_type" TYPE "campaign_trigger_type_new" USING ("trigger_type"::text::"campaign_trigger_type_new");
ALTER TYPE "campaign_trigger_type" RENAME TO "campaign_trigger_type_old";
ALTER TYPE "campaign_trigger_type_new" RENAME TO "campaign_trigger_type";
DROP TYPE "campaign_trigger_type_old";
COMMIT;
