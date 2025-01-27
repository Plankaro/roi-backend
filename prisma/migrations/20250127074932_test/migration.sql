/*
  Warnings:

  - Made the column `phoneNo` on table `Prospect` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Prospect" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phoneNo" SET NOT NULL;
