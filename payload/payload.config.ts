import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Products } from "./collections/Products";
import { Categories } from "./collections/Categories";
import { GalleryImages } from "./collections/GalleryImages";
import { Testimonials } from "./collections/Testimonials";
import { Outlets } from "./collections/Outlets";
import { BlogPosts } from "./collections/BlogPosts";
import { BlogCategories } from "./collections/BlogCategories";
import { Hero } from "./globals/Hero";
import { Story } from "./globals/Story";
import { GiftSetsBanner } from "./globals/GiftSetsBanner";
import { Announcement } from "./globals/Announcement";
import { Footer } from "./globals/Footer";
import { migrations } from "./migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Read at runtime (not NEXT_PUBLIC_, which is baked in at build time), so one
// image can be tried on a temporary domain and then moved to the real one.
const serverUrl = process.env.SERVER_URL || "http://localhost:3000";
const assetBaseUrl = (process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "").replace(/\/+$/, "");

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: {
      titleSuffix: " | AROMAVITAE Admin",
      icons: [{ rel: "icon", type: "image/x-icon", url: "/favicon.ico" }],
    },
  },
  collections: [
    Products,
    Categories,
    GalleryImages,
    Testimonials,
    Outlets,
    BlogPosts,
    BlogCategories,
    Media,
    Users,
  ],
  globals: [Hero, Story, GiftSetsBanner, Announcement, Footer],
  editor: lexicalEditor(),
  sharp,
  secret: process.env.PAYLOAD_SECRET ?? "",
  serverURL: serverUrl,
  cors: [serverUrl],
  csrf: [serverUrl],
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    // Schema changes only ever go through `npm run migrate:create` + `npm run migrate`.
    // Dev runs against the production database (there is no local one), so
    // letting `next dev` push schema diffs straight into it is never safe.
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
    // The production container applies any pending migration when it starts
    // (only when NODE_ENV=production, so never from `next dev`).
    prodMigrations: migrations,
  }),
  upload: { limits: { fileSize: 10_000_000 } },
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: "media",
          // Files are public in the bucket, so the site links straight to
          // Garage's web endpoint instead of streaming every image through Payload.
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `${assetBaseUrl}/${prefix ? `${prefix}/` : ""}${filename}`,
        },
      },
      bucket: process.env.S3_BUCKET ?? "",
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
        forcePathStyle: true,
        // Garage rejects the CRC32 checksums the SDK adds by default; only
        // send them when the API actually requires one.
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
        },
      },
    }),
  ],
});
