/*
  Warnings:

  - You are about to drop the column `manageTeam` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "manageTeam",
ADD COLUMN     "manageBots" BOOLEAN NOT NULL DEFAULT true;
