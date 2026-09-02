/**
 * Uploads assets from public/images/ to the object storage bucket,
 * skipping the `hero/` and `story/` subdirectories (those stay in public/).
 *
 * Usage:
 *   node --env-file=.env.local scripts/sync-storage.mjs
 *
 * Required env vars:
 *   S3_ENDPOINT
 *   S3_REGION
 *   S3_BUCKET
 *   S3_ACCESS_KEY_ID
 *   S3_SECRET_ACCESS_KEY
 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFileSync, readdirSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const { S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

// Subdirectories of public/images/ that are served from public/ — skip these
const PUBLIC_ONLY_DIRS = new Set(["hero", "story"]);

if (!S3_ENDPOINT || !S3_REGION || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
  console.error(
    "Error: S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be set.\n" +
    "Add them to .env.local and re-run."
  );
  process.exit(1);
}

const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
  forcePathStyle: true,
});

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!PUBLIC_ONLY_DIRS.has(entry.name)) {
        files.push(...walk(fullPath));
      }
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Garage serves back whatever `Cache-Control` was stored with the object, and
 * stores none unless it is set at PUT time. Without this every browser and
 * every CDN in front of the bucket revalidates each image on each visit — the
 * single-node VPS ends up answering requests that should never have left the
 * edge.
 *
 * These keys are overwritten in place by a re-run of this script, so they are
 * not immutable in the strict sense: a week of freshness plus a month of
 * `stale-while-revalidate` keeps them fast without pinning a replaced asset in
 * caches for a year. Admin uploads get `immutable` instead — see UploadService,
 * where every key carries a UUID and is never rewritten.
 */
const CACHE_CONTROL = "public, max-age=604800, stale-while-revalidate=2592000";

function contentType(filePath) {
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".webp")) return "image/webp";
  if (filePath.endsWith(".avif")) return "image/avif";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

const imagesDir = join(ROOT, "public", "images");
const files = walk(imagesDir);

if (files.length === 0) {
  console.log("No files found to sync.");
  process.exit(0);
}

console.log(`Syncing ${files.length} file(s) to bucket "${S3_BUCKET}"...\n`);

let ok = 0;
let fail = 0;

for (const filePath of files) {
  const storagePath = relative(imagesDir, filePath).replace(/\\/g, "/");
  const buffer = readFileSync(filePath);

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: storagePath,
        Body: buffer,
        ContentType: contentType(filePath),
        CacheControl: CACHE_CONTROL,
      })
    );
    console.log(`  OK    ${storagePath}`);
    ok++;
  } catch (error) {
    console.error(`  FAIL  ${storagePath}: ${error.message}`);
    fail++;
  }
}

console.log(`\nDone — ${ok} uploaded, ${fail} failed.`);
if (fail > 0) process.exit(1);
