/*
  Warnings:

  - The `new_checkout_abandonment_time` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `new_order_creation_time` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `trigger_time` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "new_checkout_abandonment_time",
ADD COLUMN     "new_checkout_abandonment_time" JSONB,
DROP COLUMN "new_order_creation_time",
ADD COLUMN     "new_order_creation_time" JSONB,
DROP COLUMN "trigger_time",
ADD COLUMN     "trigger_time" JSONB;
