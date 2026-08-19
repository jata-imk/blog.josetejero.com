import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "sizes_content_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_content_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_content_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_content_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_content_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_content_filename" varchar;
  CREATE INDEX "media_sizes_content_sizes_content_filename_idx" ON "media" USING btree ("sizes_content_filename");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_sizes_content_sizes_content_filename_idx";
  ALTER TABLE "media" DROP COLUMN "sizes_content_url";
  ALTER TABLE "media" DROP COLUMN "sizes_content_width";
  ALTER TABLE "media" DROP COLUMN "sizes_content_height";
  ALTER TABLE "media" DROP COLUMN "sizes_content_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_content_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_content_filename";`)
}
