# Admin Portal — Setup & Deployment Guide

Aromavitae's admin portal at `/admin` lets non-developers edit every section of the public landing page. Follow the steps below **in order** — each step tells you what to create and what to copy before moving on.

> **Secret management:** every secret lives in **GitHub → Repo Settings → Secrets and variables → Actions**. GitHub Actions syncs them to Render on every deploy — you never touch the Render env var dashboard directly.

## Architecture

```
Browser → GitHub Pages (Next.js static export — public + /admin)
          ├── Build-time fetch GET /api/v1/content ──► Render (Express + Prisma) → Supabase Postgres
          ├── Admin write POST/PUT/DELETE (browser) ─► Render (Bearer Supabase JWT)
          └── Direct image upload (signed URL) ───────► Supabase Storage (bucket: aromavitae)
```

After every admin write the backend calls the GitHub API to trigger a `workflow_dispatch` on the
frontend workflow. GitHub Actions rebuilds and redeploys the static site — the public page updates
in **~2–3 minutes** (the Actions build time).

---

## Scratchpad

Open a private note and fill in values as you go through the steps. You will paste everything into GitHub at the end.

**Secrets (encrypted)**

| Name | Collected in step | Your value |
|---|---|---|
| `SUPABASE_URL` | 1 | https://edddprzxjdbobdtvbmaj.supabase.co |
| `SUPABASE_ANON_KEY` | 1 | REDACTED_SUPABASE_ANON_KEY |
| `SUPABASE_SERVICE_ROLE_KEY` | 1 | REDACTED_SUPABASE_SERVICE_ROLE_KEY |
| `SUPABASE_JWT_SECRET` | 1 | REDACTED_SUPABASE_JWT_SECRET |
| `DATABASE_URL` | 2 | postgresql://postgres.edddprzxjdbobdtvbmaj:REDACTED_DB_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres|
| `DIRECT_URL` | 2 | postgresql://postgres:REDACTED_DB_PASSWORD@db.edddprzxjdbobdtvbmaj.supabase.co:5432/postgres|
| `ADMIN_EMAILS` | 3 | |
| `RENDER_SERVICE_ID` | 5 | |
| `RENDER_API_KEY` | 6 | |
| `GITHUB_PAT` | 7 | |

**Variables (plaintext)**

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | same as `SUPABASE_URL` |
| `SUPABASE_STORAGE_BUCKET` | `aromavitae` |
| `API_URL` | Render service URL from step 5 |
| `FRONTEND_URL` | GitHub Pages URL from step 8 |
| `GITHUB_REPO` | `your-org/aromavitae` (set now) |
| `BASE_PATH` | `/aromavitae` (set in step 8 — see note) |

---

## Step 1 — Create Supabase project and copy API keys

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Choose your organisation, pick a name, choose a **region** close to your users, and set a strong database password. Click **Create new project** — provisioning takes about 2 minutes.
3. Once the dashboard loads, go to **Project Settings → API**.
4. **Copy** each value into your scratchpad:
   - **Project URL** → `SUPABASE_URL`
   - **Project API keys → anon public** → `SUPABASE_ANON_KEY`
   - **Project API keys → service_role** (click *Reveal*) → `SUPABASE_SERVICE_ROLE_KEY`
   - Scroll down to **JWT Settings → JWT Secret** → `SUPABASE_JWT_SECRET`

---

## Step 2 — Copy database connection strings

Connection strings are **not** in Project Settings. They live behind the **Connect** button on the project home screen.

1. From your project dashboard (the page you land on after opening the project), look at the **top navigation bar**. You will see a **Connect** button — click it.
2. A drawer/modal opens. At the top there are tabs: **Direct connection**, **Transaction pooler**, **Session pooler**. Ignore the ORMs / Frameworks tabs.
3. Click **Transaction pooler** — this shows a URI on port **6543** (PgBouncer).  
   Click **Copy** next to the URI → paste it into your scratchpad as `DATABASE_URL`.  
   In the pasted string, replace `[YOUR-PASSWORD]` with the database password you chose in step 1.
4. Click **Direct connection** — this shows a URI on port **5432** (no pooling).  
   Click **Copy** next to the URI → paste it into your scratchpad as `DIRECT_URL`.  
   Again replace `[YOUR-PASSWORD]`.

> `DATABASE_URL` (Transaction pooler, port 6543) is used at runtime. `DIRECT_URL` (Direct, port 5432) is used only by `prisma migrate deploy` and must bypass PgBouncer.

---

## Step 3 — Configure authentication and invite admins

1. Go to **Authentication → Providers → Email** — confirm it is **Enabled**.
2. Go to **Authentication → Configuration** → find **"Allow new users to sign up"** and **turn it off**. Only invited users can log in.
3. Go to **Authentication → Users → Invite user**. Enter each admin email address and send the invite. Invited users set their password via the email link.
4. **Copy** the list of invited emails as a comma-separated string into your scratchpad → `ADMIN_EMAILS` (e.g. `you@example.com,partner@example.com`).

> You will need to come back here in step 8 to update the **Site URL** once you know the GitHub Pages URL.

---

## Step 4 — Create storage bucket and access policies

1. Go to **Storage → New bucket**.
2. **Name**: `aromavitae`. Toggle **Public bucket ON**. Click **Save**.
3. Go to **SQL Editor** (left sidebar) and run each policy below:

   ```sql
   -- Allow authenticated users to upload files
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'aromavitae');
   ```

   ```sql
   -- Allow authenticated users to replace files
   CREATE POLICY "Authenticated users can update"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (bucket_id = 'aromavitae');
   ```

> The server-side admin allowlist (`ADMIN_EMAILS`) is checked before any signed upload URL is issued. These RLS policies are a second layer — they ensure the signed URL can only be used by an authenticated Supabase session.

---

## Step 5 — Create Render web service

1. Go to [render.com](https://render.com) → **New → Web Service**.
2. Connect GitHub if not already connected, then select this repository.
3. Set these fields:

   | Field | Value |
   |---|---|
   | Root Directory | `api` |
   | Runtime | Node |
   | Build command | `npm ci && npx prisma generate && npm run build` |
   | Start command | `npx prisma migrate deploy && node dist/server.js` |
   | Region | Same region as your Supabase project |

4. Leave **Environment Variables empty** — GitHub Actions will populate them.
5. Under **Advanced → Health & Alerts**, set **Health check path** to `/health`.
6. Click **Create Web Service**. The first build will fail (no env vars yet) — that is expected.
7. After the service is created, **Copy**:
   - The full service URL (e.g. `https://aromavitae-api.onrender.com`) → `API_URL`
   - The `srv-xxxxx` value from **Settings → Service ID** → `RENDER_SERVICE_ID`

---

## Step 6 — Get Render API key

1. Click your avatar → **Account Settings → API Keys → Create API Key**.
2. Give it a name (e.g. `github-actions`) and click **Create**.
3. **Copy** the key immediately → `RENDER_API_KEY`.

> Render shows the key only once. If you miss it, delete and recreate.

---

## Step 7 — Create a GitHub Personal Access Token

The backend triggers a GitHub Actions rebuild after every admin write. It needs a PAT to call the GitHub API.

1. On GitHub, click your avatar → **Settings** → **Developer settings** → **Personal access tokens → Fine-grained tokens → Generate new token**.
2. Set:
   - **Token name**: `aromavitae-rebuild`
   - **Expiration**: choose an appropriate duration
   - **Repository access**: select **Only select repositories** → choose this repo
   - **Permissions → Repository permissions → Actions**: set to **Read and write**
3. Click **Generate token**.
4. **Copy** the token immediately → `GITHUB_PAT` in your scratchpad.

> GitHub shows the token only once. If you miss it, delete and recreate.

---

## Step 8 — Enable GitHub Pages

1. Go to your GitHub repo → **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**. Click **Save**.
3. The Pages URL appears at the top of the page. It will be one of:
   - `https://<org>.github.io/aromavitae/` — if the repo is named `aromavitae` under an org
   - A custom domain — if you have one configured
4. **Copy** this URL → `FRONTEND_URL` in your scratchpad.

### Set basePath (subdirectory URLs only)

If your Pages URL contains a subdirectory (e.g. `.../aromavitae/`), the Next.js build must know the prefix so internal links resolve correctly.

In your scratchpad **Variables** table, set `BASE_PATH` to `/aromavitae` (replace `aromavitae` with your actual repo name, no trailing slash). This will be passed to the build as an environment variable — `next.config.ts` already reads `process.env.BASE_PATH`.

If you are using a **custom domain** at the root (e.g. `https://aromavitae.com`), leave `BASE_PATH` empty.

### Update Supabase Site URL

Now that you have the Pages URL, go back to Supabase → **Authentication → URL Configuration** and:
- Set **Site URL** to your GitHub Pages URL (e.g. `https://<org>.github.io/aromavitae/`).
- Under **Redirect URLs**, add `https://<org>.github.io/aromavitae/**`.

This ensures invite-email links redirect back to your site correctly.

---

## Step 9 — Create GitHub Environment

1. Go to your GitHub repo → **Settings → Environments → New environment**.
2. Name it exactly **`production`** and click **Configure environment**.
3. Leave defaults and save (add protection rules if you want).

> The backend workflow declares `environment: production`. This environment must exist for the job to pick up secrets correctly.

---

## Step 10 — Add GitHub Secrets and Variables

Go to **GitHub repo → Settings → Secrets and variables → Actions**. Your scratchpad should now be complete.

### Secrets tab

Click **New repository secret** for each:

| Name | Value |
|---|---|
| `SUPABASE_URL` | from step 1 |
| `SUPABASE_ANON_KEY` | from step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | from step 1 |
| `SUPABASE_JWT_SECRET` | from step 1 |
| `DATABASE_URL` | from step 2 |
| `DIRECT_URL` | from step 2 |
| `ADMIN_EMAILS` | from step 3 |
| `RENDER_SERVICE_ID` | from step 5 |
| `RENDER_API_KEY` | from step 6 |
| `GITHUB_PAT` | from step 7 |

### Variables tab

Click **New repository variable** for each:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | same as `SUPABASE_URL` |
| `SUPABASE_STORAGE_BUCKET` | `aromavitae` |
| `API_URL` | your Render service URL from step 5 |
| `FRONTEND_URL` | your GitHub Pages URL from step 8 |
| `GITHUB_REPO` | `your-org/aromavitae` |
| `BASE_PATH` | `/aromavitae` (or empty if custom domain) |

---

## Step 11 — Bootstrap (first deploy)

Render has no env vars yet. Trigger both workflows manually so GitHub Actions can push them:

1. **GitHub → Actions → "Deploy backend (Render)"** → **Run workflow** → select `main` → **Run workflow**.
2. Wait for it to complete (~3–5 min). Render will restart with the correct env vars and run migrations.
3. **GitHub → Actions → "Deploy frontend (GitHub Pages)"** → **Run workflow** → select `main` → **Run workflow**.

> The frontend build fetches live content from the Render API at build time. The backend **must** be healthy before you trigger the frontend workflow — that is why the order matters.

After bootstrap, normal pushes to `main` trigger the right workflow automatically:
- Files changed under `api/**` → backend workflow only
- All other files → frontend workflow only

---

## Step 12 — Verify

1. `GET https://<api-url>/health` → expect `{ "data": { "status": "ok", ... } }`
2. `GET https://<api-url>/api/v1/content` → expect the full content payload
3. Visit your GitHub Pages URL → should look identical to local
4. Sign in to `<pages-url>/admin/login` with an invited email → edit any field → save → the GitHub Actions frontend workflow should be triggered automatically, and the public page should update in **~2–3 minutes**
5. `curl -X POST https://<api-url>/api/v1/products -H 'Content-Type: application/json' -d '{}'` → should return **401**

---

## Local development

```bash
# Repository root
cp api/.env.example api/.env   # fill in values from your Supabase API page

cd api
npm install
npx prisma migrate dev         # creates tables against DATABASE_URL
npm run seed                   # seeds with initial site content
cd ..

npm install
npm run dev                    # starts Next.js (:3000) and Express (:4000) concurrently
```

- `http://localhost:3000` — public landing page (reads from the local API)
- `http://localhost:3000/admin/login` — sign in with an invited Supabase admin email

> `BASE_PATH` is not set locally, so `basePath` in `next.config.ts` defaults to `""` — the dev server runs at the root as expected.

---

## Rotating a secret

1. Update the value in **GitHub → Settings → Secrets and variables → Actions → Secrets**.
2. Re-run the relevant workflow (`workflow_dispatch`) or push a no-op commit. GitHub Actions overwrites the env var on Render on the next run.
