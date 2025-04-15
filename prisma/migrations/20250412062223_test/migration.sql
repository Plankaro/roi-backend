/*
  Warnings:

  - Added the required column `link` to the `LinkTrack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LinkTrack" ADD COLUMN     "link" TEXT NOT NULL;
