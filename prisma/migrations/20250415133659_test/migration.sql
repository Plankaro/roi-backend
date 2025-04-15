/*
  Warnings:

  - The `utm_id` column on the `LinkTrack` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "LinkTrack" DROP COLUMN "utm_id",
ADD COLUMN     "utm_id" BOOLEAN NOT NULL DEFAULT true;
