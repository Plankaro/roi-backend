/*
  Warnings:

  - Added the required column `status` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('READ', 'DELIVERED');

-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "status" "NotificationStatus" NOT NULL;
