-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "is_razorpay_connected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_shopify_connected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_whatsapp_connected" BOOLEAN NOT NULL DEFAULT false;
