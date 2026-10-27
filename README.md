# AROMAVITAE

The AROMAVITAE website and its content admin: one Next.js app with
[Payload CMS](https://payloadcms.com) running inside it.

- `/` and the other site pages: `app/(site)/`. They read content through
  Payload's Local API (a direct database call, no HTTP), in `lib/content.ts`.
- `/admin`: the Payload admin panel, `app/(payload)/`. Products, categories,
  gallery, testimonials, outlets, blog, the homepage sections and site-wide
  bits are all edited there. Changes show on the site on the next page load.
- `payload/`: the Payload config. `collections/` and `globals/` define every
  content type and its admin form; `migrations/` holds the database schema.

## Getting started

```bash
cp .env.example .env   # then fill it in
npm install
npm run dev            # http://localhost:3000, admin at /admin
```

There is no local database. `DATABASE_URI` points at the Payload database on the
VPS through an SSH tunnel, so **anything saved in the local admin is live**.

## Changing a content type

1. Edit the collection or global in `payload/collections/` or `payload/globals/`.
2. `npm run generate:types` refreshes `payload/payload-types.ts`.
3. `npm run generate:importmap` if you added admin components or editor features.
4. `npm run migrate:create <name>` writes a migration into `payload/migrations/`.
   It only diffs the config and never connects to the database.
5. `npm run migrate` applies it. This writes to the production database.

`push` is off in `payload/payload.config.ts`, so `next dev` never changes the
schema on its own.

## Moving content over from the old admin (one-off)

`npm run migrate:legacy` copies everything from the old Express/Prisma database
(`LEGACY_DATABASE_URL`, read-only) into Payload. It runs in one transaction,
refuses to run if Payload already has content, re-uploads every image as Media,
and prints a new password for each old admin account. See the header of
`payload/scripts/migrate-legacy.ts` for details.

## Image storage (Garage / S3)

Uploads go through Payload's Media collection into the bucket under `media/`
(`@payloadcms/storage-s3`). Garage has **two** endpoints and both are needed:

| Var                          | Purpose                                                   | Host shape                                |
| ---------------------------- | --------------------------------------------------------- | ----------------------------------------- |
| `S3_ENDPOINT`                | S3 API: Payload uploads and deletes files through it       | `https://s3-<node>.example.com`           |
| `NEXT_PUBLIC_ASSET_BASE_URL` | Public web endpoint: image URLs on the site point here     | `https://<bucket>.web-<node>.example.com` |

`NEXT_PUBLIC_ASSET_BASE_URL` **must** be Garage's web endpoint (bucket-as-subdomain),
not the S3 API host: anonymous GETs against the S3 API return `SignatureDoesNotMatch`.
`next.config.ts` also derives `images.remotePatterns` from it, so images from any
other host are blocked by the Next image optimizer.

### One-time VPS setup for a new bucket

Garage runs in a Docker container managed by Coolify, so admin commands go through `docker exec`. The container name looks like `garage-<random-id>` — find it with:

```bash
docker ps --format '{{.Names}}' | grep garage
```

Then create the bucket, enable its public web serving, and (if you don't already have one) create an anonymous read key. Replace `<garage-container>` with the name from the previous step and `<bucket>` with your bucket name:

```bash
# create bucket
docker exec <garage-container> /garage bucket create <bucket>

# enable Garage's website API for this bucket (this is the step that fixes 403s
# on <bucket>.web-<node>.<domain>/...)
docker exec <garage-container> /garage bucket website --allow <bucket>

# grant an anonymous read key for public GETs
docker exec <garage-container> /garage bucket allow --read --key <anonymous-key-id> <bucket>

# sanity check
docker exec <garage-container> /garage bucket info <bucket>
```

Add a reverse-proxy route for `<bucket>.web-<node>.<domain>` pointing at Garage's web port (alongside the existing `s3-<node>` route), then verify from your laptop:

```bash
curl -I https://<bucket>.web-<node>.<domain>/<year>/<object-key>
```

Expect `HTTP/2 200`. `403` means `bucket website --allow` didn't run; a connection error / cert warning means the reverse proxy route is missing.
