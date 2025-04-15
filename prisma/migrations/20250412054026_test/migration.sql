-- CreateTable
CREATE TABLE "LinkTrack" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "broadcast_id" TEXT,
    "chat_id" TEXT NOT NULL,
    "prospect_id" TEXT NOT NULL,
    "first_click" TIMESTAMP(3) NOT NULL,
    "last_click" TIMESTAMP(3) NOT NULL,
    "no_of_click" INTEGER NOT NULL,

    CONSTRAINT "LinkTrack_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "Broadcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "Prospect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
