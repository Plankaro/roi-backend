/*
  Warnings:

  - A unique constraint covering the columns `[link_track_id]` on the table `Checkout` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[from_link_id]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Checkout" ADD COLUMN     "link_track_id" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "from_link_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Checkout_link_track_id_key" ON "Checkout"("link_track_id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_from_link_id_key" ON "Order"("from_link_id");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_from_link_id_fkey" FOREIGN KEY ("from_link_id") REFERENCES "LinkTrack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_link_track_id_fkey" FOREIGN KEY ("link_track_id") REFERENCES "LinkTrack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
