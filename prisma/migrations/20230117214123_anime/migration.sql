-- AlterTable
ALTER TABLE "Anime" ADD COLUMN     "gogoanimeId" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "zoroId" JSONB NOT NULL DEFAULT '{}';
