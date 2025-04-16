/*
  Warnings:

  - You are about to drop the column `adminGraphqlApiId` on the `Fulfillment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Fulfillment_db_order_id_key";

-- AlterTable
ALTER TABLE "Fulfillment" DROP COLUMN "adminGraphqlApiId";
