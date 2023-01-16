/*
  Warnings:

  - You are about to drop the column `data` on the `Anime` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "data",
ADD COLUMN     "anidb" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "animeplanet" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "anisearch" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "kitsu" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "livechart" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "notifymoe" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "thevdb" JSONB NOT NULL DEFAULT '{}';
