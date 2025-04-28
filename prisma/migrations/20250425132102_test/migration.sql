-- CreateEnum
CREATE TYPE "Acess" AS ENUM ('READ', 'WRITE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('READ', 'DELIVERED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ASSIGNED', 'CUSTOMERSUPPORT');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Lead" AS ENUM ('LEAD', 'LOST', 'NEGOTIATION', 'OTHER');

-- CreateEnum
CREATE TYPE "BotType" AS ENUM ('WELCOME', 'PRODUCT_BROWSING', 'ORDER_CANCEL', 'SHIPPING_CHARGES', 'REPEAT_ORDER', 'DISCOUNT', 'ORDER_TRACK');

-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('CAMPAIGN', 'BROADCAST', 'OTHER');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "HeaderType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'TEXT');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('image', 'text', 'document');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "broadcastStatus" AS ENUM ('pending', 'completed', 'running');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('excel', 'shopify');

-- CreateEnum
CREATE TYPE "Limitexced" AS ENUM ('pause', 'skip');

-- CreateEnum
CREATE TYPE "BroadCastType" AS ENUM ('PROMOTIONAL', 'TRANSACTIONAL');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('AUTHENTICATION', 'MARKETING', 'UTILITY');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "trigger_type" AS ENUM ('AFTER_EVENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "discount_type" AS ENUM ('PERCENTAGE', 'AMOUNT');

-- CreateEnum
CREATE TYPE "campaign_trigger_type" AS ENUM ('AFTER_CAMPAIGN_CREATED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('ORDER_CREATED', 'ORDER_UPDATED', 'ORDER_CANCELLED', 'CHECKOUT_CREATED', 'FULFILLMENT_CREATED', 'FULFILLMENT_EVENT_CREATED', 'ORDER_TAG_ADDED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrderMethod" AS ENUM ('confirmed', 'label_printed', 'label_purchases', 'ready_for_pickup', 'picked_up', 'in_transit', 'out_for_delivery', 'attemped_delivery', 'failed_delivery', 'delivered');

-- CreateEnum
CREATE TYPE "PaymentOptionType" AS ENUM ('PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "time_unit" AS ENUM ('DAY', 'HOUR', 'MINUTE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT,
    "refreshToken" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL,
    "businessId" TEXT,
    "ManageBroadcast" BOOLEAN NOT NULL DEFAULT true,
    "manageBots" BOOLEAN NOT NULL DEFAULT true,
    "manageCampaign" BOOLEAN NOT NULL DEFAULT true,
    "assignChat" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "expiresAt" INTEGER,
    "tokenType" TEXT,
    "scope" TEXT,
    "idToken" TEXT,
    "sessionState" TEXT,
    "refreshTokenExpiresIn" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_shopify_connected" BOOLEAN NOT NULL DEFAULT false,
    "shopify_Token" TEXT,
    "shopify_domain" TEXT,
    "shopify_url" TEXT,
    "is_whatsapp_connected" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp_mobile_id" TEXT,
    "whatsapp_mobile" TEXT,
    "whatsapp_token" TEXT,
    "whatsapp_buisness_id" TEXT,
    "whatsapp_app_id" TEXT,
    "is_razorpay_connected" BOOLEAN NOT NULL DEFAULT false,
    "razorpay_id" TEXT,
    "razorpay_secret" TEXT,
    "is_google_analytics_connected" BOOLEAN NOT NULL DEFAULT false,
    "is_meta_pixel" BOOLEAN NOT NULL DEFAULT false,
    "g_mesurement_id" TEXT,
    "g_api_secret" TEXT,
    "p_track_id" TEXT,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "tagName" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "shopify_id" TEXT,
    "name" TEXT,
    "email" TEXT,
    "image" TEXT,
    "last_Online" TIMESTAMP(3),
    "phoneNo" TEXT NOT NULL,
    "lead" "Lead" NOT NULL DEFAULT 'LEAD',
    "assignedToId" TEXT,
    "buisnessId" TEXT NOT NULL,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "buisness_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProspectTag" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProspectTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "shopify_id" TEXT NOT NULL,
    "customer_phoneno" TEXT NOT NULL,
    "db_checkout_id" TEXT,
    "propspect_id" TEXT,
    "status" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromBroadcast" BOOLEAN NOT NULL DEFAULT false,
    "BroadCastId" TEXT,
    "shopify_store" TEXT,
    "order_status_url" TEXT,
    "processed_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "cart_token" TEXT,
    "checkout_id" TEXT,
    "checkout_token" TEXT,
    "closed_at" TIMESTAMP(3),
    "confirmation_number" TEXT,
    "confirmed" BOOLEAN,
    "contact_email" TEXT,
    "created_at" TIMESTAMP(3),
    "currency" TEXT,
    "shipping_address" JSONB,
    "tags" TEXT,
    "discount_codes" JSONB,
    "fulfillment_status" TEXT,
    "landing_site" TEXT,
    "merchant_business_entity_id" TEXT,
    "name" TEXT,
    "order_number" INTEGER,
    "shipping_lines" JSONB,
    "total_weight" INTEGER,
    "updated_at" TIMESTAMP(3),
    "buisnessId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bots" (
    "id" TEXT NOT NULL,
    "type" "BotType" NOT NULL,
    "discount_type" "discount_type" NOT NULL DEFAULT 'PERCENTAGE',
    "buisness_id" TEXT NOT NULL,
    "discount_amount" TEXT NOT NULL DEFAULT '10',
    "discount_expiry" TEXT NOT NULL DEFAULT '7',
    "discount_minimum" TEXT NOT NULL DEFAULT '200',
    "no_of_days_before_asking_discount" TEXT NOT NULL DEFAULT '7',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "shipping_standard_cost" TEXT NOT NULL DEFAULT '150',
    "shipping_threshold" TEXT NOT NULL DEFAULT '200',
    "international_shipping_cost" TEXT NOT NULL DEFAULT '200',

    CONSTRAINT "Bots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkTrack" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "broadcast_id" TEXT,
    "buisness_id" TEXT,
    "chat_id" TEXT,
    "prospect_id" TEXT,
    "first_click" TIMESTAMP(3),
    "last_click" TIMESTAMP(3),
    "no_of_click" INTEGER NOT NULL DEFAULT 0,
    "link" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_id" TEXT,
    "checkout_id" TEXT,
    "OrderId" TEXT,
    "type" "LinkType" NOT NULL DEFAULT 'OTHER',
    "order_generated" BOOLEAN NOT NULL DEFAULT false,
    "is_test_link" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LinkTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "chatId" TEXT,
    "senderPhoneNo" TEXT NOT NULL,
    "receiverPhoneNo" TEXT NOT NULL,
    "sendDate" TIMESTAMP(3) NOT NULL,
    "template_used" BOOLEAN NOT NULL DEFAULT false,
    "template_name" TEXT,
    "template_components" JSONB,
    "senderId" TEXT,
    "header_type" "HeaderType",
    "header_value" TEXT,
    "body_text" TEXT,
    "footer_included" BOOLEAN NOT NULL DEFAULT false,
    "footer_text" TEXT,
    "Buttons" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "Status" "MessageStatus" NOT NULL DEFAULT 'pending',
    "failedReason" TEXT,
    "prospectId" TEXT,
    "isForBroadcast" BOOLEAN NOT NULL DEFAULT false,
    "broadcastId" TEXT,
    "isForRetry" BOOLEAN NOT NULL DEFAULT false,
    "retryId" TEXT,
    "isForCampaign" BOOLEAN NOT NULL DEFAULT false,
    "campaignId" TEXT,
    "isAutomated" BOOLEAN NOT NULL DEFAULT false,
    "botName" TEXT,
    "ContactId" TEXT,
    "type" TEXT NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarredCustomers" (
    "id" TEXT NOT NULL,
    "shopify_id" TEXT NOT NULL,
    "BuisnessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StarredCustomers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broadcast" (
    "id" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BroadCastType" NOT NULL,
    "status" "broadcastStatus" NOT NULL DEFAULT 'pending',
    "template_language" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT,
    "total_contact" INTEGER NOT NULL,
    "createdForId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "scheduledDate" TIMESTAMP(3),
    "price" TEXT NOT NULL,
    "links_visit" INTEGER NOT NULL DEFAULT 0,
    "unique_order_created" INTEGER NOT NULL DEFAULT 0,
    "onlimit_exced" "Limitexced" NOT NULL,
    "retry_limit" INTEGER NOT NULL DEFAULT 0,
    "contacts_type" "ContactType" NOT NULL,
    "segment_id" TEXT,
    "componentData" JSONB NOT NULL,
    "excelData" JSONB,
    "utm_campaign" TEXT,
    "utm_medium" TEXT,
    "utm_source" TEXT,
    "utm_term" BOOLEAN NOT NULL DEFAULT false,
    "utm_id" BOOLEAN DEFAULT false,
    "avoid_duplicate" BOOLEAN NOT NULL DEFAULT true,
    "limit_marketing_message_enabled" BOOLEAN NOT NULL DEFAULT true,
    "limit_marketing_message_messagenumber" INTEGER,
    "limit_marketing_message_duration" TEXT,
    "skip_inactive_contacts_enabled" BOOLEAN NOT NULL DEFAULT true,
    "skip_inactive_contacts_days" INTEGER,
    "reply_count" INTEGER NOT NULL DEFAULT 0,
    "unique_interactions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retry" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "broadcastStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Retry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contacts" (
    "id" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "status" TEXT,
    "createdBy" TEXT,
    "BroadCastId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "whatsapp_id" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "status" "TemplateStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "createdForId" TEXT,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashResponse" (
    "id" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "createdForId" TEXT,
    "shareWithOthers" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FlashResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" "CampaignType" NOT NULL DEFAULT 'CHECKOUT_CREATED',
    "type" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "trigger_type" "campaign_trigger_type" NOT NULL,
    "trigger_time" JSONB,
    "template_name" TEXT NOT NULL,
    "template_type" TEXT NOT NULL,
    "template_lang" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "is_discount_given" BOOLEAN NOT NULL DEFAULT true,
    "discount" INTEGER,
    "coupon_code" TEXT,
    "discount_type" "discount_type" NOT NULL DEFAULT 'PERCENTAGE',
    "filter_condition_match" BOOLEAN NOT NULL,
    "new_checkout_abandonment_filter" BOOLEAN NOT NULL,
    "new_checkout_abandonment_type" "trigger_type",
    "new_checkout_abandonment_time" JSONB,
    "new_order_creation_filter" BOOLEAN,
    "new_order_creation_type" "trigger_type" NOT NULL,
    "new_order_creation_time" JSONB,
    "related_order_created" BOOLEAN NOT NULL DEFAULT false,
    "related_order_fulfilled" BOOLEAN NOT NULL DEFAULT false,
    "related_order_cancelled" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "businessId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reply_action" TEXT,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filter" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "is_order_tag_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
    "order_tag_filter_all" TEXT[],
    "order_tag_filter_any" TEXT[],
    "order_tag_filter_none" TEXT[],
    "is_product_tag_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
    "product_tag_filter_all" TEXT[],
    "product_tag_filter_any" TEXT[],
    "product_tag_filter_none" TEXT[],
    "is_customer_tag_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
    "customer_tag_filter_all" TEXT[],
    "customer_tag_filter_any" TEXT[],
    "customer_tag_filter_none" TEXT[],
    "is_discount_code_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
    "discount_code_filter_any" TEXT[],
    "discount_code_filter_none" TEXT[],
    "is_payment_gateway_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
    "payment_gateway_filter_any" TEXT[],
    "payment_gateway_filter_none" TEXT[],
    "is_payment_option_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
    "payment_options_type" "PaymentOptionType",
    "is_send_to_unsub_customer_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
    "send_to_unsub_customer" BOOLEAN,
    "is_order_amount_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
    "order_amount_filter_greater_or_equal" INTEGER,
    "order_amount_filter_less_or_equal" INTEGER,
    "order_amount_min" INTEGER,
    "order_amount_max" INTEGER,
    "is_discount_amount_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
    "discount_amount_filter_greater_or_equal" INTEGER,
    "discount_amount_filter_less_or_equal" INTEGER,
    "discount_amount_min" INTEGER,
    "discount_amount_max" INTEGER,
    "is_order_delivery_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_order_count_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
    "order_count_greater_or_equal" INTEGER,
    "order_count_less_or_equal" INTEGER,
    "order_count_min" INTEGER,
    "order_count_max" INTEGER,
    "order_method" "OrderMethod",

    CONSTRAINT "Filter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkout" (
    "id" TEXT NOT NULL,
    "shopify_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "cartToken" TEXT NOT NULL,
    "email" TEXT,
    "gateway" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "landingSite" TEXT NOT NULL,
    "note" TEXT,
    "noteAttributes" JSONB,
    "domain" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "phone" TEXT,
    "customerLocale" TEXT,
    "lineItems" JSONB,
    "name" TEXT,
    "abandonedCheckoutUrl" TEXT,
    "discountCodes" JSONB,
    "taxLines" JSONB,
    "presentmentCurrency" TEXT,
    "sourceName" TEXT,
    "totalLineItemsPrice" TEXT,
    "totalTax" TEXT,
    "totalDiscounts" TEXT NOT NULL,
    "subtotalPrice" TEXT NOT NULL,
    "totalPrice" TEXT NOT NULL,
    "totalDuties" TEXT NOT NULL,
    "customer" JSONB,
    "source" TEXT,
    "closedAt" TIMESTAMP(3),
    "for_campaign" BOOLEAN NOT NULL DEFAULT false,
    "shipping_address" JSONB,
    "billingAddress" JSONB,
    "processedAt" TIMESTAMP(3),
    "businessId" TEXT,

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutOnCampaign" (
    "checkoutId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutOnCampaign_pkey" PRIMARY KEY ("checkoutId","campaignId")
);

-- CreateTable
CREATE TABLE "OrderCampaign" (
    "orderId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderCampaign_pkey" PRIMARY KEY ("orderId","campaignId")
);

-- CreateTable
CREATE TABLE "PaymentLink" (
    "id" TEXT NOT NULL,
    "razorpay_link_id" TEXT NOT NULL,
    "order_id" TEXT,
    "amount" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "description" TEXT,
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "status" TEXT NOT NULL,
    "short_url" TEXT NOT NULL,
    "expire_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "campaign_id" TEXT,
    "businessId" TEXT,

    CONSTRAINT "PaymentLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fulfillment" (
    "id" TEXT NOT NULL,
    "shopify_id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "db_order_id" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "service" TEXT NOT NULL,
    "trackingCompany" TEXT,
    "shipmentStatus" TEXT,
    "locationId" BIGINT,
    "originAddress" JSONB,
    "email" TEXT,
    "trackingNumber" TEXT,
    "trackingNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "trackingUrl" TEXT,
    "trackingUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "receipt" JSONB,
    "name" TEXT NOT NULL,
    "destination" JSONB,
    "lineItems" JSONB NOT NULL,

    CONSTRAINT "Fulfillment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "discount_type" NOT NULL,
    "code" TEXT NOT NULL,
    "usageLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prospect_id" TEXT NOT NULL,

    CONSTRAINT "discount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Business_shopify_domain_key" ON "Business"("shopify_domain");

-- CreateIndex
CREATE UNIQUE INDEX "Business_whatsapp_mobile_key" ON "Business"("whatsapp_mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_shopify_id_key" ON "Prospect"("shopify_id");

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_buisnessId_phoneNo_key" ON "Prospect"("buisnessId", "phoneNo");

-- CreateIndex
CREATE UNIQUE INDEX "ProspectTag_prospectId_tagId_key" ON "ProspectTag"("prospectId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_shopify_id_key" ON "Order"("shopify_id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_db_checkout_id_key" ON "Order"("db_checkout_id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_cart_token_key" ON "Order"("cart_token");

-- CreateIndex
CREATE UNIQUE INDEX "Order_checkout_id_key" ON "Order"("checkout_id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_checkout_token_key" ON "Order"("checkout_token");

-- CreateIndex
CREATE UNIQUE INDEX "Bots_buisness_id_type_key" ON "Bots"("buisness_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_chatId_key" ON "Chat"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "Template_whatsapp_id_key" ON "Template"("whatsapp_id");

-- CreateIndex
CREATE UNIQUE INDEX "Filter_campaign_id_key" ON "Filter"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "Checkout_shopify_id_key" ON "Checkout"("shopify_id");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_razorpay_link_id_key" ON "PaymentLink"("razorpay_link_id");

-- CreateIndex
CREATE UNIQUE INDEX "Fulfillment_shopify_id_key" ON "Fulfillment"("shopify_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_buisnessId_fkey" FOREIGN KEY ("buisnessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_buisness_id_fkey" FOREIGN KEY ("buisness_id") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProspectTag" ADD CONSTRAINT "ProspectTag_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProspectTag" ADD CONSTRAINT "ProspectTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_db_checkout_id_fkey" FOREIGN KEY ("db_checkout_id") REFERENCES "Checkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_propspect_id_fkey" FOREIGN KEY ("propspect_id") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_BroadCastId_fkey" FOREIGN KEY ("BroadCastId") REFERENCES "Broadcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buisnessId_fkey" FOREIGN KEY ("buisnessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bots" ADD CONSTRAINT "Bots_buisness_id_fkey" FOREIGN KEY ("buisness_id") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_buisness_id_fkey" FOREIGN KEY ("buisness_id") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "Broadcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_checkout_id_fkey" FOREIGN KEY ("checkout_id") REFERENCES "Checkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_id_fkey" FOREIGN KEY ("id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_retryId_fkey" FOREIGN KEY ("retryId") REFERENCES "Retry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarredCustomers" ADD CONSTRAINT "StarredCustomers_BuisnessId_fkey" FOREIGN KEY ("BuisnessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_createdForId_fkey" FOREIGN KEY ("createdForId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retry" ADD CONSTRAINT "Retry_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_BroadCastId_fkey" FOREIGN KEY ("BroadCastId") REFERENCES "Broadcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_createdForId_fkey" FOREIGN KEY ("createdForId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashResponse" ADD CONSTRAINT "FlashResponse_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashResponse" ADD CONSTRAINT "FlashResponse_createdForId_fkey" FOREIGN KEY ("createdForId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filter" ADD CONSTRAINT "Filter_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutOnCampaign" ADD CONSTRAINT "CheckoutOnCampaign_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "Checkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutOnCampaign" ADD CONSTRAINT "CheckoutOnCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCampaign" ADD CONSTRAINT "OrderCampaign_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCampaign" ADD CONSTRAINT "OrderCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fulfillment" ADD CONSTRAINT "Fulfillment_db_order_id_fkey" FOREIGN KEY ("db_order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount" ADD CONSTRAINT "discount_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "Prospect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
