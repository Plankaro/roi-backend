/*
  Warnings:

  - The values [BETWEEN_TRIGGER_TO_EVENT] on the enum `trigger_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "trigger_type_new" AS ENUM ('AFTER_EVENT', 'CUSTOM');
ALTER TABLE "Campaign" ALTER COLUMN "new_checkout_abandonment_type" TYPE "trigger_type_new" USING ("new_checkout_abandonment_type"::text::"trigger_type_new");
ALTER TABLE "Campaign" ALTER COLUMN "new_order_creation_type" TYPE "trigger_type_new" USING ("new_order_creation_type"::text::"trigger_type_new");
ALTER TYPE "trigger_type" RENAME TO "trigger_type_old";
ALTER TYPE "trigger_type_new" RENAME TO "trigger_type";
DROP TYPE "trigger_type_old";
COMMIT;
