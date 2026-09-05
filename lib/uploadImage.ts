import type { AdminApi } from "@/lib/api";

interface SignedUrlResponse {
  uploadUrl: string;
  path: string;
  publicUrl: string;
  /**
   * Headers the API signed into `uploadUrl` — currently `Content-Type` and the
   * `Cache-Control` that Garage stores with the object. They are part of the
   * SigV4 signature, so the PUT has to send exactly these and nothing else, or
   * Garage rejects it as a mismatch.
   */
  requiredHeaders?: Record<string, string>;
}

/**
 * Mirrors `uploadRequestSchema` on the API (api/src/types/upload.ts). Checking
 * here turns a generic 400 from the signed-url call into a message that names
 * the offending file — which matters most in a multi-file batch, where one bad
 * pick would otherwise look like the whole upload failed.
 */
const SAFE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

/** Returns a human-readable reason the file can't be uploaded, or null if it's fine. */
export function describeRejection(file: File): string | null {
  if (!SAFE_EXT.test(file.name)) {
    return `${file.name}: unsupported file type — use JPG, PNG, WebP, GIF or AVIF.`;
  }
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return `${file.name}: not a supported image type.`;
  }
  return null;
}

/** Mints a signed URL, PUTs the file to object storage, and returns its public URL. */
export async function uploadImage(api: AdminApi, file: File): Promise<string> {
  const signed = await api.post<SignedUrlResponse>("/uploads/signed-url", {
    filename: file.name,
    contentType: file.type,
  });
  const put = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: signed.requiredHeaders ?? { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);
  return signed.publicUrl;
}
