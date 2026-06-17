-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('creator', 'brand', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'deleted');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('google', 'instagram');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('none', 'pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "PayoutMethodType" AS ENUM ('upi', 'bank');

-- CreateEnum
CREATE TYPE "MediaPurpose" AS ENUM ('brand_logo', 'creator_avatar', 'portfolio_image');

-- CreateEnum
CREATE TYPE "MediaAssetStatus" AS ENUM ('pending', 'uploaded', 'attached', 'deleted', 'failed');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('bounty', 'campaign');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'active', 'archived', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('instagram');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('reel', 'post', 'story');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('submitted', 'competing', 'under_review', 'qualified', 'won', 'paid', 'not_qualified', 'rejected');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('new_campaign', 'application_accepted', 'submission_reviewed', 'winner_announced', 'payment_released', 'deadline_reminder');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('pending', 'funded', 'released', 'refunded', 'failed');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'processing', 'paid', 'failed', 'on_hold');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_profiles" (
    "user_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "instagram_handle" TEXT,
    "instagram_user_id" TEXT,
    "followers_count" INTEGER,
    "average_views" INTEGER,
    "average_likes" INTEGER,
    "avatar_url" TEXT,
    "location" TEXT,
    "niches" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "content_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'none',
    "trust_score" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "avatar_asset_id" UUID,

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "creator_payout_methods" (
    "id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "type" "PayoutMethodType" NOT NULL,
    "upi_id_encrypted" TEXT,
    "upi_id_masked" TEXT,
    "account_holder_enc" TEXT,
    "account_number_last4" TEXT,
    "account_number_enc" TEXT,
    "ifsc_encrypted" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT true,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "creator_payout_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_portfolio_items" (
    "id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'instagram',
    "content_type" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "image_asset_id" UUID,
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "creator_portfolio_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_profiles" (
    "user_id" UUID NOT NULL,
    "brand_name" TEXT NOT NULL,
    "bio" TEXT,
    "industry" TEXT,
    "website" TEXT,
    "work_email" TEXT,
    "logo_url" TEXT,
    "social_links" JSONB NOT NULL DEFAULT '{}',
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'none',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "trust_score" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "logo_asset_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "brand_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "type" "CampaignType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'instagram',
    "content_type" "ContentType" NOT NULL,
    "min_followers" INTEGER NOT NULL DEFAULT 0,
    "required_hashtag" TEXT NOT NULL,
    "required_mention" TEXT NOT NULL,
    "deadline" TIMESTAMPTZ(6) NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "total_budget" INTEGER NOT NULL,
    "max_creators" INTEGER,
    "min_views_threshold" INTEGER,
    "fixed_reward" INTEGER,
    "prize_first" INTEGER,
    "prize_second" INTEGER,
    "prize_third" INTEGER,
    "prize_top20_each" INTEGER,
    "published_at" TIMESTAMPTZ(6),
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_applications" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "reviewed_at" TIMESTAMPTZ(6),
    "reviewed_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "campaign_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_submissions" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "post_url" TEXT NOT NULL,
    "note" TEXT,
    "platform" "Platform" NOT NULL DEFAULT 'instagram',
    "platform_media_id" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'submitted',
    "validation_result" JSONB NOT NULL DEFAULT '{}',
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "engagement_score" INTEGER NOT NULL DEFAULT 0,
    "rejection_reason" TEXT,
    "validated_at" TIMESTAMPTZ(6),
    "reviewed_at" TIMESTAMPTZ(6),
    "reviewed_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "campaign_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "purpose" "MediaPurpose" NOT NULL,
    "status" "MediaAssetStatus" NOT NULL DEFAULT 'pending',
    "storage_key" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "byte_size_expected" INTEGER NOT NULL,
    "byte_size_actual" INTEGER,
    "public_url" TEXT,
    "uploaded_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "user_id" UUID NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMPTZ(6),
    "raw_profile" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("provider","provider_account_id")
);

-- CreateTable
CREATE TABLE "oauth_states" (
    "state_hash" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'creator',
    "user_id" UUID,
    "redirect_to" TEXT,
    "code_verifier" TEXT,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_states_pkey" PRIMARY KEY ("state_hash")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_transactions" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "amount_inr" INTEGER NOT NULL,
    "released_amount_inr" INTEGER NOT NULL DEFAULT 0,
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "status" "EscrowStatus" NOT NULL DEFAULT 'pending',
    "failure_reason" TEXT,
    "funded_at" TIMESTAMPTZ(6),
    "released_at" TIMESTAMPTZ(6),
    "refunded_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "escrow_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "escrow_id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "amount_inr" INTEGER NOT NULL,
    "razorpay_payout_id" TEXT,
    "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "failure_reason" TEXT,
    "paid_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_avatar_asset_id_key" ON "creator_profiles"("avatar_asset_id");

-- CreateIndex
CREATE INDEX "creator_profiles_instagram_handle_idx" ON "creator_profiles"("instagram_handle");

-- CreateIndex
CREATE INDEX "creator_payout_methods_creator_id_idx" ON "creator_payout_methods"("creator_id");

-- CreateIndex
CREATE UNIQUE INDEX "creator_portfolio_items_image_asset_id_key" ON "creator_portfolio_items"("image_asset_id");

-- CreateIndex
CREATE INDEX "creator_portfolio_items_creator_id_sort_order_idx" ON "creator_portfolio_items"("creator_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "brand_profiles_logo_asset_id_key" ON "brand_profiles"("logo_asset_id");

-- CreateIndex
CREATE INDEX "campaigns_brand_id_status_idx" ON "campaigns"("brand_id", "status");

-- CreateIndex
CREATE INDEX "campaigns_status_deadline_idx" ON "campaigns"("status", "deadline");

-- CreateIndex
CREATE INDEX "campaign_applications_campaign_id_status_idx" ON "campaign_applications"("campaign_id", "status");

-- CreateIndex
CREATE INDEX "campaign_applications_creator_id_status_idx" ON "campaign_applications"("creator_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_applications_campaign_id_creator_id_key" ON "campaign_applications"("campaign_id", "creator_id");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_submissions_application_id_key" ON "campaign_submissions"("application_id");

-- CreateIndex
CREATE INDEX "campaign_submissions_campaign_id_status_idx" ON "campaign_submissions"("campaign_id", "status");

-- CreateIndex
CREATE INDEX "campaign_submissions_creator_id_status_idx" ON "campaign_submissions"("creator_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_storage_key_key" ON "media_assets"("storage_key");

-- CreateIndex
CREATE INDEX "media_assets_owner_id_purpose_status_idx" ON "media_assets"("owner_id", "purpose", "status");

-- CreateIndex
CREATE INDEX "oauth_accounts_user_id_idx" ON "oauth_accounts"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "escrow_transactions_campaign_id_key" ON "escrow_transactions"("campaign_id");

-- CreateIndex
CREATE INDEX "escrow_transactions_brand_id_status_idx" ON "escrow_transactions"("brand_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_submission_id_key" ON "payouts"("submission_id");

-- CreateIndex
CREATE INDEX "payouts_campaign_id_status_idx" ON "payouts"("campaign_id", "status");

-- CreateIndex
CREATE INDEX "payouts_creator_id_status_idx" ON "payouts"("creator_id", "status");

-- CreateIndex
CREATE INDEX "payouts_escrow_id_idx" ON "payouts"("escrow_id");

-- AddForeignKey
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_avatar_asset_id_fkey" FOREIGN KEY ("avatar_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_payout_methods" ADD CONSTRAINT "creator_payout_methods_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creator_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_portfolio_items" ADD CONSTRAINT "creator_portfolio_items_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creator_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_portfolio_items" ADD CONSTRAINT "creator_portfolio_items_image_asset_id_fkey" FOREIGN KEY ("image_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_logo_asset_id_fkey" FOREIGN KEY ("logo_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_applications" ADD CONSTRAINT "campaign_applications_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_applications" ADD CONSTRAINT "campaign_applications_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_applications" ADD CONSTRAINT "campaign_applications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_submissions" ADD CONSTRAINT "campaign_submissions_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "campaign_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_submissions" ADD CONSTRAINT "campaign_submissions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_submissions" ADD CONSTRAINT "campaign_submissions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_submissions" ADD CONSTRAINT "campaign_submissions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_states" ADD CONSTRAINT "oauth_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "escrow_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "campaign_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
