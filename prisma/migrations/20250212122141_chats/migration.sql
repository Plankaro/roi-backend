/*
  Warnings:

  - Added the required column `chatId` to the `Contacts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "ContactId" TEXT;

-- AlterTable
ALTER TABLE "Contacts" ADD COLUMN     "chatId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
