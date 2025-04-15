-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('CAMPAIGN', 'BROADCAST', 'OTHER');

-- AlterTable
ALTER TABLE "LinkTrack" ADD COLUMN     "order_generated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "LinkType" NOT NULL DEFAULT 'OTHER';
