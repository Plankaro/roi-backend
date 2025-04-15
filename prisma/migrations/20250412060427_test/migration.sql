-- AlterTable
ALTER TABLE "LinkTrack" ALTER COLUMN "first_click" DROP NOT NULL,
ALTER COLUMN "last_click" DROP NOT NULL,
ALTER COLUMN "no_of_click" SET DEFAULT 0;
