-- AlterTable
ALTER TABLE "LinkTrack" ADD COLUMN     "utm_campaign" TEXT,
ADD COLUMN     "utm_medium" TEXT,
ADD COLUMN     "utm_source" TEXT,
ALTER COLUMN "link" DROP NOT NULL;
