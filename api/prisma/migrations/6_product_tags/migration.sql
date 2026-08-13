-- AlterTable
ALTER TABLE "products" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT '{}';

-- Backfill existing single badge values into the new tags array
UPDATE "products" SET "tags" = ARRAY["badge"] WHERE "badge" IS NOT NULL AND "badge" <> '';

-- AlterTable
ALTER TABLE "products" DROP COLUMN "badge";
