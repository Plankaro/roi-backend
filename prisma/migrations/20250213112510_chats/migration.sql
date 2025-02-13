/*
  Warnings:

  - The `last_Online` column on the `Prospect` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "last_Online",
ADD COLUMN     "last_Online" TIMESTAMP(3);
