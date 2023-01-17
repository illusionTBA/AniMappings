/*
  Warnings:

  - You are about to drop the column `crunchyrollId` on the `Anime` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Anime" DROP COLUMN "crunchyrollId",
ADD COLUMN     "cronchyId" JSONB NOT NULL DEFAULT '{}';
