/*
  Warnings:

  - You are about to drop the column `link_track_id` on the `Checkout` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Checkout" DROP CONSTRAINT "Checkout_link_track_id_fkey";

-- DropForeignKey
ALTER TABLE "Prospect" DROP CONSTRAINT "Prospect_buisnessNo_fkey";

-- DropIndex
DROP INDEX "Checkout_link_track_id_key";

-- AlterTable
ALTER TABLE "Checkout" DROP COLUMN "link_track_id";

-- AlterTable
ALTER TABLE "LinkTrack" ADD COLUMN     "checkout_id" TEXT;

-- AlterTable
ALTER TABLE "Prospect" ALTER COLUMN "buisnessNo" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_buisnessNo_fkey" FOREIGN KEY ("buisnessNo") REFERENCES "Business"("whatsapp_mobile") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_checkout_id_fkey" FOREIGN KEY ("checkout_id") REFERENCES "Checkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
