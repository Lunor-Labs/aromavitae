This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Image storage (Garage / S3)

Uploads go through the API's `POST /uploads/signed-url` → browser `PUT` to Garage → the returned `publicUrl` is what's stored in the DB and rendered later. Because Garage has **two** endpoints, the API needs both env vars set correctly:

| Var             | Purpose                                                       | Host shape                                        |
| --------------- | ------------------------------------------------------------- | ------------------------------------------------- |
| `S3_ENDPOINT`   | S3 API — used server-side to presign PUT uploads              | `https://s3-<node>.example.com`                   |
| `S3_PUBLIC_URL` | Public web endpoint — embedded in DB rows, fetched by browser | `https://<bucket>.web-<node>.example.com`         |

`S3_PUBLIC_URL` **must** point at Garage's web endpoint (bucket-as-subdomain), not the S3 API host. Anonymous browser GETs against the S3 API return `SignatureDoesNotMatch`, so images render broken even though the object exists.

The frontend also needs `NEXT_PUBLIC_ASSET_BASE_URL` set to the same web endpoint — `next.config.ts` derives `images.remotePatterns` from it, and any URL from a different host will be blocked by the Next image optimizer.

### One-time VPS setup for a new bucket

Garage runs in a Docker container managed by Coolify, so admin commands go through `docker exec`. The container name looks like `garage-<random-id>` — find it with:

```bash
docker ps --format '{{.Names}}' | grep garage
```

Then create the bucket, create the two keys it needs, and enable its public web serving. Replace `<garage-container>` with the name from the previous step and `<bucket>` with your bucket name:

```bash
# create bucket
docker exec <garage-container> /garage bucket create <bucket>

# create the key the API presigns uploads with — this prints the Key ID and the
# secret. The secret is shown ONCE; copy both into Coolify as S3_ACCESS_KEY_ID
# and S3_SECRET_ACCESS_KEY.
docker exec <garage-container> /garage key create aromavitae-api

# grant that key read+write — presigned PUTs fail with AccessDenied without it
docker exec <garage-container> /garage bucket allow --read --write --key <api-key-id> <bucket>

# enable Garage's website API for this bucket (this is the step that fixes 403s
# on <bucket>.web-<node>.<domain>/...)
docker exec <garage-container> /garage bucket website --allow <bucket>

# grant an anonymous read key for public GETs
docker exec <garage-container> /garage bucket allow --read --key <anonymous-key-id> <bucket>

# sanity check — lists both keys and their permissions
docker exec <garage-container> /garage bucket info <bucket>
```

The two keys are deliberately separate: the API key can write, the anonymous key
can only read. Never put the API key's secret in any `NEXT_PUBLIC_*` var — that
ships the write credential to every browser.

Add a reverse-proxy route for `<bucket>.web-<node>.<domain>` pointing at Garage's web port (alongside the existing `s3-<node>` route), then verify from your laptop:

```bash
curl -I https://<bucket>.web-<node>.<domain>/<year>/<object-key>
```

Expect `HTTP/2 200`. `403` means `bucket website --allow` didn't run; a connection error / cert warning means the reverse proxy route is missing.

### CORS — required for browser uploads

The admin panel uploads by `PUT`ting straight from the browser to Garage's S3
endpoint, so that request is cross-origin and Garage must answer the preflight.
Garage implements `PutBucketCors` / `GetBucketCors` / `DeleteBucketCors` but has
**no `garage bucket cors` CLI subcommand** — set it through the S3 API instead.

Save the policy, listing every origin that will upload:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "https://aromavitae.com",
        "https://<your-vercel-preview>.vercel.app",
        "http://localhost:3000"
      ],
      "AllowedMethods": ["PUT", "GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Apply and confirm it (see the env exports in the next section):

```bash
aws --endpoint-url "$S3" s3api put-bucket-cors --bucket <bucket> \
  --cors-configuration file://cors.json

aws --endpoint-url "$S3" s3api get-bucket-cors --bucket <bucket>
```

`AllowedOrigins` is matched exactly — scheme, host, and port, no trailing slash,
no wildcard subdomain matching. A Vercel preview deploy on a new URL will fail
until its origin is added.

### Verifying the bucket

Garage needs two non-default AWS CLI settings: path-style addressing (the API
sets `forcePathStyle: true` in `api/src/lib/s3.ts`) and checksums off. AWS CLI
v2.23+ sends a CRC32 checksum by default that Garage rejects — the same
incompatibility worked around for presigned URLs in `api/src/lib/s3.ts`.

```bash
export AWS_ACCESS_KEY_ID=<S3_ACCESS_KEY_ID>
export AWS_SECRET_ACCESS_KEY=<S3_SECRET_ACCESS_KEY>
export AWS_DEFAULT_REGION=<S3_REGION>
export AWS_REQUEST_CHECKSUM_CALCULATION=when_required
aws configure set default.s3.addressing_style path

S3=https://s3-<node>.<domain>              # S3_ENDPOINT
WEB=https://<bucket>.web-<node>.<domain>   # S3_PUBLIC_URL
```

Run in order — each command isolates one failure mode:

```bash
aws --endpoint-url "$S3" s3 ls                       # 1. key valid, bucket visible
echo probe > probe.txt
aws --endpoint-url "$S3" s3 cp probe.txt s3://<bucket>/probe.txt --content-type text/plain
aws --endpoint-url "$S3" s3api get-bucket-cors --bucket <bucket>   # 2. CORS set
curl -I "$WEB/probe.txt"                             # 3. anonymous public read → 200
aws --endpoint-url "$S3" s3 rm s3://<bucket>/probe.txt            # 4. clean up
```

| Symptom | Cause |
| --- | --- |
| `s3 ls` → `InvalidAccessKeyId` / `SignatureDoesNotMatch` | wrong key, or `AWS_DEFAULT_REGION` doesn't match `S3_REGION` |
| `s3 ls` succeeds but bucket missing | key has no grant — `bucket allow` never ran for it |
| `cp` → `AccessDenied` | key is read-only; presigned PUTs fail the same way |
| `cp` → checksum / `XAmzContentSHA256Mismatch` | `AWS_REQUEST_CHECKSUM_CALCULATION=when_required` not exported |
| `get-bucket-cors` → `NoSuchCORSConfiguration` | no CORS — CLI still works, browser uploads don't |
| `curl -I` → `403` | `bucket website --allow` didn't run |
| `curl -I` → cert error | reverse-proxy route for the web endpoint is missing |

A clean CLI run is necessary but **not sufficient** — the CLI never sends a
preflight, so it cannot detect broken CORS. The only end-to-end check is the
real path: `POST /api/v1/uploads/signed-url` (admin JWT required, see
`api/src/routes/uploads.ts`) followed by the browser's cross-origin `PUT`, i.e.
upload an image in the admin panel with the Network tab open. Broken CORS shows
as an `OPTIONS` request whose response has no `Access-Control-Allow-Origin`.

### Fixing broken URLs from an older misconfiguration

If a batch of rows was written while `S3_PUBLIC_URL` was pointing at the wrong host, either re-upload those assets through the admin panel (new uploads always use the current env), or run the one-off backfill.

You need the API's `DATABASE_URL` — grab it from Coolify (your project → the API service → Environment Variables). The value there uses an internal Docker hostname that isn't reachable from your laptop, so rebuild the URL against the host-published port on the Postgres service (in Coolify → the Postgres service → Configuration → Ports Mappings, e.g. `<host-port>:5432`):

```powershell
# PowerShell (Windows) — replace with values from Coolify
$env:DATABASE_URL = "postgresql://<db-user>:<pw>@<vps-host>:<host-port>/<db-name>"
$env:OLD_PREFIX   = "https://s3-<node>.<domain>"
$env:NEW_PREFIX   = "https://<bucket>.web-<node>.<domain>"

cd api
npm run backfill:image-urls
```

Expected output:

```
Rewriting host: https://s3-<node>.<domain>/ → https://<bucket>.web-<node>.<domain>/
[products]   scanned=N rewritten=M
[categories] scanned=N rewritten=M
[outlets]    scanned=N rewritten=M
[singletons] scanned=N rewritten=M
```

The script only rewrites rows whose URL starts with `OLD_PREFIX`, so it's safe to re-run and won't touch correctly-uploaded newer rows. If `scanned=0` across the board, you're pointed at the wrong Postgres (an empty DB) — double-check which Postgres container Coolify has your API service connected to.
