/*
  Warnings:

  - Added the required column `title` to the `Anime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL;
