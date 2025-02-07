/*
  Warnings:

  - Added the required column `name` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_createdBy_fkey";

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "createdForId" DROP NOT NULL,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
