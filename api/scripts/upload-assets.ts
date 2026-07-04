/**
 * One-time script to upload static assets from public/images/ to
 * the Supabase Storage bucket configured in the API's .env.
 *
 * Usage:  npx tsx api/scripts/upload-assets.ts
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "aromavitae";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PUBLIC_IMAGES_DIR = path.resolve(__dirname, "../../public/images");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

/** Recursively collect all image files under a directory. */
function collectFiles(dir: string, base: string = ""): { filePath: string; storagePath: string }[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: { filePath: string; storagePath: string }[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = base ? `${base}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, relativePath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (MIME[ext]) {
        results.push({ filePath: fullPath, storagePath: relativePath });
      }
    }
  }

  return results;
}

async function main() {
  console.log(`Bucket:  ${BUCKET}`);
  console.log(`Source:  ${PUBLIC_IMAGES_DIR}\n`);

  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    console.error(`Directory not found: ${PUBLIC_IMAGES_DIR}`);
    process.exit(1);
  }

  const files = collectFiles(PUBLIC_IMAGES_DIR);
  console.log(`Found ${files.length} image(s) to upload.\n`);

  let success = 0;
  let failed = 0;

  for (const { filePath, storagePath } of files) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    const fileBuffer = fs.readFileSync(filePath);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`  ✗ ${storagePath} — ${error.message}`);
      failed++;
    } else {
      const { data: publicData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);
      console.log(`  ✓ ${storagePath} → ${publicData.publicUrl}`);
      success++;
    }
  }

  console.log(`\nDone. ${success} uploaded, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
