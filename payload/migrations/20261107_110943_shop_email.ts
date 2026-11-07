import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'sendOrderEmail';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'sendNewOrderAlert';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'sendSetPasswordEmail';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'sendOrderEmail';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'sendNewOrderAlert';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'sendSetPasswordEmail';
  CREATE TABLE "email_settings_staff_alerts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "email_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reply_to" varchar,
  	"signature" varchar,
  	"confirmation_subject" varchar,
  	"confirmation_intro" varchar,
  	"shipped_subject" varchar,
  	"shipped_intro" varchar,
  	"delivered_subject" varchar,
  	"delivered_intro" varchar,
  	"cancelled_subject" varchar,
  	"cancelled_intro" varchar,
  	"set_password_subject" varchar,
  	"set_password_intro" varchar,
  	"password_reset_subject" varchar,
  	"password_reset_intro" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "email_settings_staff_alerts" ADD CONSTRAINT "email_settings_staff_alerts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."email_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "email_settings_staff_alerts_order_idx" ON "email_settings_staff_alerts" USING btree ("_order");
  CREATE INDEX "email_settings_staff_alerts_parent_id_idx" ON "email_settings_staff_alerts" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "email_settings_staff_alerts" CASCADE;
  DROP TABLE "email_settings" CASCADE;
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'expireUnpaidOrders');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'expireUnpaidOrders');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";`)
}
