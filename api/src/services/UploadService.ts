import { randomUUID } from 'node:crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/config/env';
import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { s3 } from '@/lib/s3';
import type { UploadRequest } from '@/types/upload';

const SAFE_NAME = /[^a-zA-Z0-9.\-_]/g;
const UPLOAD_URL_TTL_SECONDS = 60 * 5;

/**
 * Every key minted below carries a fresh UUID and is never rewritten — editing
 * an image in the admin uploads a new key and repoints the DB row — so the
 * object at a given URL really is immutable and can be cached indefinitely.
 *
 * Garage only ever returns a `Cache-Control` that was supplied at PUT time, and
 * because it is set on the command here it becomes part of the presigned
 * signature: the browser's PUT must send this header back verbatim or the
 * upload fails as a signature mismatch. `requiredHeaders` below carries it to
 * the client so the two can't drift apart.
 */
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

export class UploadService {
  async createSignedUpload(input: UploadRequest): Promise<{
    uploadUrl: string;
    path: string;
    publicUrl: string;
    requiredHeaders: Record<string, string>;
  }> {
    const safeName = input.filename.replace(SAFE_NAME, '_');
    const path = `${new Date().getFullYear()}/${randomUUID()}-${safeName}`;

    try {
      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: path,
          ContentType: input.contentType,
          CacheControl: CACHE_CONTROL,
        }),
        { expiresIn: UPLOAD_URL_TTL_SECONDS }
      );

      return {
        uploadUrl,
        path,
        publicUrl: `${env.S3_PUBLIC_URL}/${path}`,
        requiredHeaders: {
          'Content-Type': input.contentType,
          'Cache-Control': CACHE_CONTROL,
        },
      };
    } catch (error) {
      logger.error({ error }, 'Failed to create signed upload URL');
      throw new AppError('Could not create upload URL', 500, 'STORAGE_ERROR');
    }
  }
}
