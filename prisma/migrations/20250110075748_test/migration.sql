/*
  Warnings:

  - Added the required column `createdForId` to the `Broadcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `FlashResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdForId` to the `FlashResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdForId` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_userId_fkey";

-- DropForeignKey
ALTER TABLE "Prospect" DROP CONSTRAINT "Prospect_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_businessId_fkey";

-- AlterTable
ALTER TABLE "Broadcast" ADD COLUMN     "createdForId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FlashResponse" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "createdForId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "createdForId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_createdForId_fkey" FOREIGN KEY ("createdForId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_createdForId_fkey" FOREIGN KEY ("createdForId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashResponse" ADD CONSTRAINT "FlashResponse_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashResponse" ADD CONSTRAINT "FlashResponse_createdForId_fkey" FOREIGN KEY ("createdForId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
