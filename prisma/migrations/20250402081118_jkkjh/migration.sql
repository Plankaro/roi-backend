/*
  Warnings:

  - A unique constraint covering the columns `[db_checkout_id]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "db_checkout_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_db_checkout_id_key" ON "Order"("db_checkout_id");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_db_checkout_id_fkey" FOREIGN KEY ("db_checkout_id") REFERENCES "Checkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
