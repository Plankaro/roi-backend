/*
  Warnings:

  - The values [delivery_update] on the enum `CampaignType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `AssignChats` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `BroadcastManageMent` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `CampaignManageMent` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `TeamManagementAcess` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CampaignType_new" AS ENUM ('abondoned_checkout', 'cod_to_prepaid', 'after_order_delivery');
ALTER TABLE "Campaign" ALTER COLUMN "type" TYPE "CampaignType_new" USING ("type"::text::"CampaignType_new");
ALTER TYPE "CampaignType" RENAME TO "CampaignType_old";
ALTER TYPE "CampaignType_new" RENAME TO "CampaignType";
DROP TYPE "CampaignType_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "AssignChats",
DROP COLUMN "BroadcastManageMent",
DROP COLUMN "CampaignManageMent",
DROP COLUMN "TeamManagementAcess",
ADD COLUMN     "ManageBroadcast" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "Managebroadcast" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "assignChat" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "manageCampaign" BOOLEAN NOT NULL DEFAULT true;
