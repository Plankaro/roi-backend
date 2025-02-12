-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_prospectId_fkey";

-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "prospectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
