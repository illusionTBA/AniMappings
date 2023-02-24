-- DropIndex
DROP INDEX "Title_native_key";

-- AlterTable
ALTER TABLE "Title" ALTER COLUMN "native" DROP NOT NULL;
