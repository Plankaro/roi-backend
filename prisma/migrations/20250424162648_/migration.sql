/*
  Warnings:

  - A unique constraint covering the columns `[buisnessId,phoneNo]` on the table `Prospect` will be added. If there are existing duplicate values, this will fail.
  - Made the column `buisnessId` on table `Prospect` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Prospect" DROP CONSTRAINT "Prospect_buisnessId_fkey";

-- AlterTable
ALTER TABLE "Prospect" ALTER COLUMN "buisnessId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_buisnessId_phoneNo_key" ON "Prospect"("buisnessId", "phoneNo");

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_buisnessId_fkey" FOREIGN KEY ("buisnessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
