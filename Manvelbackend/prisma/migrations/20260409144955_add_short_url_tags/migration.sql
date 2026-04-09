-- CreateTable
CREATE TABLE "short_url_tags" (
    "short_url_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "short_url_tags_pkey" PRIMARY KEY ("short_url_id","tag_id")
);

-- CreateIndex
CREATE INDEX "short_url_tags_tag_id_idx" ON "short_url_tags"("tag_id");

-- AddForeignKey
ALTER TABLE "short_url_tags" ADD CONSTRAINT "short_url_tags_short_url_id_fkey" FOREIGN KEY ("short_url_id") REFERENCES "short_urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_url_tags" ADD CONSTRAINT "short_url_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
