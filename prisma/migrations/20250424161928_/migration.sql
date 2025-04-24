/*
  Warnings:

  - You are about to drop the column `buisnessNo` on the `Prospect` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Prospect" DROP CONSTRAINT "Prospect_buisnessNo_fkey";

-- DropIndex
DROP INDEX "Prospect_buisnessNo_phoneNo_key";

-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "buisnessNo",
ADD COLUMN     "buisnessId" TEXT;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_buisnessId_fkey" FOREIGN KEY ("buisnessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
