/*
  Warnings:

  - A unique constraint covering the columns `[abbreviation]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `abbreviation` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "abbreviation" SET NOT NULL,
ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_abbreviation_key" ON "User"("abbreviation");
