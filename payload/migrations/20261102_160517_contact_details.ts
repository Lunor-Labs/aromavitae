import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "contact_details_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"whatsapp" boolean
  );
  
  CREATE TABLE "contact_details" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"address" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "contact_details_phones" ADD CONSTRAINT "contact_details_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_details"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "contact_details_phones_order_idx" ON "contact_details_phones" USING btree ("_order");
  CREATE INDEX "contact_details_phones_parent_id_idx" ON "contact_details_phones" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "contact_details_phones" CASCADE;
  DROP TABLE "contact_details" CASCADE;`)
}
