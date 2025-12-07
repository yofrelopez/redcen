-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('PRESS_NOTE', 'STATEMENT', 'EVENT', 'PODCAST', 'VIDEO', 'OPINION', 'DOCUMENT', 'ALERT', 'GALLERY', 'REPORT');

-- AlterTable
ALTER TABLE "PressNote" ADD COLUMN     "district" TEXT,
ADD COLUMN     "mainImageAlt" TEXT,
ADD COLUMN     "mainImageCaption" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "scheduledFor" TIMESTAMP(3),
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "type" "NoteType" NOT NULL DEFAULT 'PRESS_NOTE',
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "abbreviation" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "banner" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "googleMapsUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "publicEmail" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "socialLinks" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");
