-- DropForeignKey
ALTER TABLE "LinkTrack" DROP CONSTRAINT "LinkTrack_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "LinkTrack" DROP CONSTRAINT "LinkTrack_prospect_id_fkey";

-- AlterTable
ALTER TABLE "LinkTrack" ALTER COLUMN "chat_id" DROP NOT NULL,
ALTER COLUMN "prospect_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
