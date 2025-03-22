/*
  Warnings:

  - You are about to drop the column `shopifyId` on the `discount` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "discount_shopifyId_key";

-- AlterTable
ALTER TABLE "discount" DROP COLUMN "shopifyId";
