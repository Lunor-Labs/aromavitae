import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_shipping_zones_countries" AS ENUM('AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BR', 'IO', 'VG', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM', 'CA', 'KY', 'CF', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'XK', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'KP', 'MK', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'KR', 'SS', 'ES', 'LK', 'SD', 'SR', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'VI', 'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UZ', 'VU', 'VA', 'VE', 'VN', 'WF', 'YE', 'ZM', 'ZW');
  CREATE TABLE "shipping_zones_countries" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_shipping_zones_countries",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "shipping_zones_methods_bands" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"up_to_grams" numeric,
  	"price_lkr" numeric NOT NULL
  );
  
  CREATE TABLE "shipping_zones_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"estimate" varchar,
  	"free_over_lkr" numeric
  );
  
  CREATE TABLE "shipping_zones" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"is_fallback" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "shipping_zones_id" integer;
  ALTER TABLE "shipping_zones_countries" ADD CONSTRAINT "shipping_zones_countries_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."shipping_zones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shipping_zones_methods_bands" ADD CONSTRAINT "shipping_zones_methods_bands_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shipping_zones_methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shipping_zones_methods" ADD CONSTRAINT "shipping_zones_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shipping_zones"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "shipping_zones_countries_order_idx" ON "shipping_zones_countries" USING btree ("order");
  CREATE INDEX "shipping_zones_countries_parent_idx" ON "shipping_zones_countries" USING btree ("parent_id");
  CREATE INDEX "shipping_zones_methods_bands_order_idx" ON "shipping_zones_methods_bands" USING btree ("_order");
  CREATE INDEX "shipping_zones_methods_bands_parent_id_idx" ON "shipping_zones_methods_bands" USING btree ("_parent_id");
  CREATE INDEX "shipping_zones_methods_order_idx" ON "shipping_zones_methods" USING btree ("_order");
  CREATE INDEX "shipping_zones_methods_parent_id_idx" ON "shipping_zones_methods" USING btree ("_parent_id");
  CREATE INDEX "shipping_zones_updated_at_idx" ON "shipping_zones" USING btree ("updated_at");
  CREATE INDEX "shipping_zones_created_at_idx" ON "shipping_zones" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_shipping_zones_fk" FOREIGN KEY ("shipping_zones_id") REFERENCES "public"."shipping_zones"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_shipping_zones_id_idx" ON "payload_locked_documents_rels" USING btree ("shipping_zones_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shipping_zones_countries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shipping_zones_methods_bands" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shipping_zones_methods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shipping_zones" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "shipping_zones_countries" CASCADE;
  DROP TABLE "shipping_zones_methods_bands" CASCADE;
  DROP TABLE "shipping_zones_methods" CASCADE;
  DROP TABLE "shipping_zones" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_shipping_zones_fk";
  
  DROP INDEX "payload_locked_documents_rels_shipping_zones_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "shipping_zones_id";
  DROP TYPE "public"."enum_shipping_zones_countries";`)
}
