-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "g_api_secret" TEXT,
ADD COLUMN     "g_mesurement_id" TEXT,
ADD COLUMN     "is_google_analytics_connected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_meta_pixel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "p_track_id" TEXT;
