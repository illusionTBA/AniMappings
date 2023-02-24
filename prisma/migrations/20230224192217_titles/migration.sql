-- CreateTable
CREATE TABLE "Title" (
    "id" TEXT NOT NULL,
    "english" TEXT,
    "native" TEXT NOT NULL,
    "romaji" TEXT,
    "animeId" TEXT,

    CONSTRAINT "Title_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Title_id_key" ON "Title"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Title_native_key" ON "Title"("native");

-- AddForeignKey
ALTER TABLE "Title" ADD CONSTRAINT "Title_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE SET NULL ON UPDATE CASCADE;
