import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_variants" ADD COLUMN "stock" numeric;
  ALTER TABLE "products_variants" ADD COLUMN "weight_grams" numeric;
  ALTER TABLE "products" ADD COLUMN "stock" numeric;
  ALTER TABLE "products" ADD COLUMN "weight_grams" numeric;
  ALTER TABLE "products" ADD COLUMN "domestic_only" boolean DEFAULT false;
  ALTER TABLE "products" ADD COLUMN "low_stock_at" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_variants" DROP COLUMN "stock";
  ALTER TABLE "products_variants" DROP COLUMN "weight_grams";
  ALTER TABLE "products" DROP COLUMN "stock";
  ALTER TABLE "products" DROP COLUMN "weight_grams";
  ALTER TABLE "products" DROP COLUMN "domestic_only";
  ALTER TABLE "products" DROP COLUMN "low_stock_at";`)
}
