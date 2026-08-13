-- AlterTable
ALTER TABLE "products" ADD COLUMN "side_images" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "products" ADD COLUMN "description" TEXT;
ALTER TABLE "products" ADD COLUMN "is_best_seller" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN "category_id" TEXT;

-- Auto-create categories for distinct product.category strings that have no
-- case-insensitive name match in the categories table
INSERT INTO "categories" ("id", "name", "image", "href", "sort_order", "updated_at")
SELECT 'mig-cat-' || md5(LOWER(p."category")), UPPER(p."category"), MIN(p."image"), '/products', 100, CURRENT_TIMESTAMP
FROM "products" p
WHERE NOT EXISTS (SELECT 1 FROM "categories" c WHERE LOWER(c."name") = LOWER(p."category"))
GROUP BY LOWER(p."category"), UPPER(p."category");

-- Backfill the FK by case-insensitive name match
UPDATE "products" p SET "category_id" = c."id"
FROM "categories" c WHERE LOWER(c."name") = LOWER(p."category");

-- DropIndex
DROP INDEX "products_category_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "category";

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");
