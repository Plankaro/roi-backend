/*
  Warnings:

  - The `status` column on the `Broadcast` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "broadcastStatus" AS ENUM ('pending', 'completed');

-- AlterTable
ALTER TABLE "Broadcast" DROP COLUMN "status",
ADD COLUMN     "status" "broadcastStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Retry" ADD COLUMN     "status" "broadcastStatus" NOT NULL DEFAULT 'pending';
