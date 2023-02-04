/*
  Warnings:

  - You are about to drop the column `thevdb` on the `Anime` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[malId]` on the table `Anime` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "thevdb",
ADD COLUMN     "malId" INTEGER,
ADD COLUMN     "thetvdb" JSONB,
ALTER COLUMN "anidb" DROP NOT NULL,
ALTER COLUMN "anidb" DROP DEFAULT,
ALTER COLUMN "animeplanet" DROP NOT NULL,
ALTER COLUMN "animeplanet" DROP DEFAULT,
ALTER COLUMN "anisearch" DROP NOT NULL,
ALTER COLUMN "anisearch" DROP DEFAULT,
ALTER COLUMN "kitsu" DROP NOT NULL,
ALTER COLUMN "kitsu" DROP DEFAULT,
ALTER COLUMN "livechart" DROP NOT NULL,
ALTER COLUMN "livechart" DROP DEFAULT,
ALTER COLUMN "notifymoe" DROP NOT NULL,
ALTER COLUMN "notifymoe" DROP DEFAULT,
ALTER COLUMN "tmdb" DROP NOT NULL,
ALTER COLUMN "tmdb" DROP DEFAULT,
ALTER COLUMN "gogoanimeId" DROP NOT NULL,
ALTER COLUMN "gogoanimeId" DROP DEFAULT,
ALTER COLUMN "zoroId" DROP NOT NULL,
ALTER COLUMN "zoroId" DROP DEFAULT,
ALTER COLUMN "cronchyId" DROP NOT NULL,
ALTER COLUMN "cronchyId" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Anime_malId_key" ON "Anime"("malId");
