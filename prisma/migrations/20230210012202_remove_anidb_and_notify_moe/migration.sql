/*
  Warnings:

  - You are about to drop the column `animeplanet` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `notifymoe` on the `Anime` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "animeplanet",
DROP COLUMN "notifymoe";
