/*
  Warnings:

  - You are about to drop the column `isPrivate` on the `FlashResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FlashResponse" DROP COLUMN "isPrivate",
ADD COLUMN     "shareWithOthers" BOOLEAN NOT NULL DEFAULT true;
