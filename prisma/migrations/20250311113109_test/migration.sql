/*
  Warnings:

  - You are about to drop the column `description` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "order_status_url" TEXT,
ADD COLUMN     "processed_at" TIMESTAMP(3);
