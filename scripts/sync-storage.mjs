/**
 * Uploads assets from public/images/ to the Supabase storage bucket,
 * skipping the `hero/` and `story/` subdirectories (those stay in public/).
 *
 * Usage:
 *   node --env-file=.env.local scripts/sync-storage.mjs
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "aromavitae";

// Subdirectories of public/images/ that are served from public/ — skip these
const PUBLIC_ONLY_DIRS = new Set(["hero", "story"]);

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n" +
    "Add SUPABASE_SERVICE_ROLE_KEY to .env.local and re-run."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

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

console.log(`Syncing ${files.length} file(s) to Supabase bucket "${BUCKET}"...\n`);

let ok = 0;
let fail = 0;

for (const filePath of files) {
  const storagePath = relative(imagesDir, filePath).replace(/\\/g, "/");
  const buffer = readFileSync(filePath);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: contentType(filePath), upsert: true });

  if (error) {
    console.error(`  FAIL  ${storagePath}: ${error.message}`);
    fail++;
  } else {
    console.log(`  OK    ${storagePath}`);
    ok++;
  }
}

console.log(`\nDone — ${ok} uploaded, ${fail} failed.`);
if (fail > 0) process.exit(1);
