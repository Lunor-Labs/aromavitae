import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "price_max" numeric;
  ALTER TABLE "products" ADD COLUMN "tagline" varchar;
  ALTER TABLE "products" ADD COLUMN "card_text" varchar;
  ALTER TABLE "categories" ADD COLUMN "headline" varchar;
  ALTER TABLE "categories" ADD COLUMN "intro" varchar;
  ALTER TABLE "categories" ADD COLUMN "highlight" varchar;
  ALTER TABLE "categories" ADD COLUMN "signoff" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "price_max";
  ALTER TABLE "products" DROP COLUMN "tagline";
  ALTER TABLE "products" DROP COLUMN "card_text";
  ALTER TABLE "categories" DROP COLUMN "headline";
  ALTER TABLE "categories" DROP COLUMN "intro";
  ALTER TABLE "categories" DROP COLUMN "highlight";
  ALTER TABLE "categories" DROP COLUMN "signoff";`)
}
