-- CreateEnum
CREATE TYPE "Acess" AS ENUM ('READ', 'WRITE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "BroadcastManageMent" "Acess",
ADD COLUMN     "TeamManagement" "Acess";
