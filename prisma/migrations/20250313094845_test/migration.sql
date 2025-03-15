/*
  Warnings:

  - You are about to drop the column `fullfillments` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "fullfillments",
ADD COLUMN     "fulfillments" JSONB;
