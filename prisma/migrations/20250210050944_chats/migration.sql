/*
  Warnings:

  - Added the required column `buisnessNo` to the `Prospect` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "buisnessNo" TEXT NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;
