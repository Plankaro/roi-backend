-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ASSIGNED', 'CUSTOMERSUPPORT');

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "buisness_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_buisness_id_fkey" FOREIGN KEY ("buisness_id") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
