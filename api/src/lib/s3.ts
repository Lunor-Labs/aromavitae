import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@/config/env';

export const s3 = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
  // Garage rejects the CRC32 checksum the SDK bakes into presigned PUT URLs:
  // it hashes the (empty) body at signing time, so the browser's real upload
  // never matches. Only send checksums when the API actually requires them.
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});
