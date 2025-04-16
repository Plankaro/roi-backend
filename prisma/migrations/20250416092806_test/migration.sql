/*
  Warnings:

  - You are about to drop the column `fulfillments` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[db_order_id]` on the table `Fulfillment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Fulfillment" ADD COLUMN     "db_order_id" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "fulfillments";

-- CreateIndex
CREATE UNIQUE INDEX "Fulfillment_db_order_id_key" ON "Fulfillment"("db_order_id");

-- AddForeignKey
ALTER TABLE "Fulfillment" ADD CONSTRAINT "Fulfillment_db_order_id_fkey" FOREIGN KEY ("db_order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
