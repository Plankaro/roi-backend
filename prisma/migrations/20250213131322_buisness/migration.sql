/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the `_BusinessEmployees` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessEmployees" DROP CONSTRAINT "_BusinessEmployees_A_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessEmployees" DROP CONSTRAINT "_BusinessEmployees_B_fkey";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "createdBy";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "businessId" TEXT;

-- DropTable
DROP TABLE "_BusinessEmployees";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
