import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_variants_size_unit" AS ENUM('ml', 'g', 'kg', 'pcs');
  CREATE TABLE "products_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size_value" numeric NOT NULL,
  	"size_unit" "enum_products_variants_size_unit" NOT NULL,
  	"price" numeric NOT NULL,
  	"sale_price" numeric,
  	"image_id" integer
  );
  
  ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL;
  ALTER TABLE "products" ADD COLUMN "sale_price" numeric;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_variants_order_idx" ON "products_variants" USING btree ("_order");
  CREATE INDEX "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
  CREATE INDEX "products_variants_image_idx" ON "products_variants" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_variants" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_variants" CASCADE;
  ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL;
  ALTER TABLE "products" DROP COLUMN "sale_price";
  DROP TYPE "public"."enum_products_variants_size_unit";`)
}
