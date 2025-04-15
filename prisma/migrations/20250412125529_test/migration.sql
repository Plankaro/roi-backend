-- AlterTable
ALTER TABLE "LinkTrack" ADD COLUMN     "buisness_id" TEXT;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_buisness_id_fkey" FOREIGN KEY ("buisness_id") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
