/*
  Warnings:

  - You are about to drop the `_ProspectToTag` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `Broadcast` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BroadCastType" AS ENUM ('PROMOTIONAL', 'TRANSACTIONAL');

-- DropForeignKey
ALTER TABLE "_ProspectToTag" DROP CONSTRAINT "_ProspectToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProspectToTag" DROP CONSTRAINT "_ProspectToTag_B_fkey";

-- AlterTable
ALTER TABLE "Broadcast" DROP COLUMN "type",
ADD COLUMN     "type" "BroadCastType" NOT NULL;

-- DropTable
DROP TABLE "_ProspectToTag";
