# VPS Deploy Setup — Aromavitae Backend

End-to-end steps: provisioning the OVHcloud VPS through a working run of
`.github/workflows/backend-coolify.yml`. Do the phases in order — each one
depends on values (IPs, keys, webhook URLs) produced by the phase before it.

## Phase A — Provision & harden the VPS

1. Purchase the OVHcloud VPS — 2 vCPU / 4GB RAM / 40GB SSD. Choose **Ubuntu
   24.04 LTS** as the OS; it's what Coolify's install script targets.
2. Note the VPS's public IP once it's provisioned — you'll reuse it several
   times below.
3. SSH in as root, create a non-root sudo user, and copy your own SSH public
   key onto it.

   > Before you continue: disable password auth and root login so the box
   > isn't sitting open to credential-stuffing bots the moment it's reachable.

   ```bash
   adduser deploy && usermod -aG sudo deploy
   rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

   # in /etc/ssh/sshd_config
   PasswordAuthentication no
   PermitRootLogin no

   systemctl restart sshd
   ```

4. Install and enable the firewall — allow SSH, HTTP/HTTPS, and Coolify's
   setup port.

   ```bash
   ufw allow 22
   ufw allow 80
   ufw allow 443
   ufw allow 8000   # temporary — Coolify's first-run screen
   ufw enable
   ```

## Phase B — Point DNS at the box

5. Add A records pointing at the VPS IP for every subdomain you'll need:

   ```
   coolify.yourdomain.com          → VPS IP
   aromavitae-api.yourdomain.com   → VPS IP   (backend, production)
   aromavitae-api-staging.yourdomain.com → VPS IP   (backend, staging — optional)
   ```

   Object storage doesn't need a DNS entry here — it's a managed, external
   S3-compatible service (see Phase D), not something hosted on this VPS.

## Phase C — Install Coolify

6. Run Coolify's official install script over SSH on the VPS.

   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```

7. Open the Coolify UI at `http://<vps-ip>:8000` and create the admin
   account.
8. In Coolify's settings, set its own dashboard domain to
   `coolify.yourdomain.com` and let it issue a Let's Encrypt certificate
   through its built-in proxy.

## Phase D — Shared database and object storage

No Supabase anywhere in this stack — auth and file storage are handled by
the backend app itself (bcrypt + JWT, and an S3-compatible object store),
backed by one shared Postgres. See "Two things replaced Supabase" below for
why.

9. Create a Coolify Project called **`core`** — this holds only the shared,
   platform-level Postgres, not any single app's resources.
10. In `core`, add a plain **PostgreSQL Database** resource (not a bundled
    "service" template) — this is `core-postgres` (or whatever you named
    it), the one Postgres server every project's database will live on.
11. Create `aromavitae`'s own database on it:
    ```sql
    CREATE DATABASE aromavitae_production;
    ```
12. Set up an S3-compatible object storage bucket for file uploads — OVHcloud
    Object Storage (managed, separate from the VPS) is the default choice;
    self-hosted MinIO works too but adds another container to maintain. Note
    down: endpoint URL, region, bucket name, access key ID, secret access
    key, and the bucket's public base URL.
13. Only add a **staging** database/environment now if you actually need one
    yet. For a single project's first launch, deploying straight to
    production is reasonable — revisit once a second project or a real user
    base shows up.

## Phase E — Deploy the backend app

14. Create a Coolify Project called **`aromavitae`** and add a new
    Application resource configured as **image-based** (not git-based).
15. Point it at `ghcr.io/lunor-labs/aromavitae-backend:latest`. If you made a
    staging environment, its app points at the `:dev` tag instead.
16. Set its environment variables directly in Coolify:

    ```
    DATABASE_URL              # postgresql://...@core-postgres:5432/aromavitae_production
    ADMIN_JWT_SECRET          # random 32+ char string — also goes on the Vercel frontend
    S3_ENDPOINT
    S3_REGION
    S3_BUCKET
    S3_ACCESS_KEY_ID
    S3_SECRET_ACCESS_KEY
    S3_PUBLIC_URL
    FRONTEND_URL
    NODE_ENV=production
    LOG_LEVEL=info
    PORT=4000
    ```

17. Set its domain — `aromavitae-api.yourdomain.com` (and
    `aromavitae-api-staging.yourdomain.com` for the staging app, if present).
18. Attach this app to the same Docker network as `core-postgres` so
    `DATABASE_URL` can resolve it by hostname. Note that network's name —
    it becomes the `DOCKER_NETWORK` GitHub variable in Phase H.
19. Under Coolify's Registries settings, add GHCR credentials — a GitHub PAT
    scoped to `read:packages` — so Coolify can pull the private image.
20. Copy the app's **Deploy Webhook** URL from its resource page. This
    becomes the `COOLIFY_DEPLOY_WEBHOOK` secret in Phase H.
21. On the frontend (Vercel), set `NEXT_PUBLIC_API_URL` (the backend's
    domain), `NEXT_PUBLIC_ASSET_BASE_URL` (= `S3_PUBLIC_URL` above), and
    `ADMIN_JWT_SECRET` (the exact same value as the backend's — middleware
    verifies the admin session cookie with it).
22. Create the first admin account by running, from anywhere with network
    access to the database:
    ```bash
    DATABASE_URL=<aromavitae_production DATABASE_URL> \
      npm --prefix api run create-admin -- --email you@aromavitae.com --password '...'
    ```

### Two things replaced Supabase

- **Auth**: `AdminUser` table (bcrypt password hash) + a JWT the backend
  signs/verifies itself (`api/src/lib/auth.ts`). The frontend stores the
  token in a plain (non-httpOnly) cookie so both `middleware.ts` (via `jose`,
  edge-compatible) and client-side API calls can use it — same trust model
  the old Supabase session token had.
- **Storage**: signed S3 `PutObjectCommand` URLs (`api/src/services/UploadService.ts`)
  instead of Supabase Storage's signed upload URLs. Functionally a drop-in
  swap — the frontend still does a plain `fetch(uploadUrl, { method: "PUT" })`.

## Phase F — Authenticate the VPS to GHCR

23. SSH into the VPS once and log its Docker daemon into GHCR — this is
    separate from Coolify's own registry credentials, and lets the
    migration step's ad-hoc container pull the image too.

    ```bash
    docker login ghcr.io -u <github-username> -p <PAT with read:packages>
    ```

## Phase G — Give CI its own SSH access

24. Generate a dedicated keypair for CI — don't reuse your personal one.

    ```bash
    ssh-keygen -t ed25519 -f coolify-ci-deploy -C "github-actions"
    ```

25. On the VPS, create (or reuse) a **limited** deploy user for this — add
    it to the `docker` group only, not `sudo`. A leaked CI key should be
    able to run containers, nothing more. Append the new key's **public**
    half to that user's `~/.ssh/authorized_keys`.
26. Keep the **private** half — it becomes the `VPS_SSH_KEY` GitHub secret.

## Phase H — Configure GitHub

27. Settings → Actions → General → Workflow permissions → set **Read and
    write permissions**. Without this, `GITHUB_TOKEN` can't push to GHCR.
28. Settings → Environments — confirm `production` already exists (it does,
    from the Render workflow) and create `staging`.
29. Add the secrets and variables below to **both** environments, each with
    that environment's own values:

    | Name | Kind | Same across environments? | Where it came from |
    |---|---|---|---|
    | `COOLIFY_DEPLOY_WEBHOOK` | secret | No — one per environment | Phase E, step 20 |
    | `DATABASE_URL` | secret | No — one per environment | Phase D, step 11 |
    | `VPS_HOST` | secret | Yes | Phase A, step 2 |
    | `VPS_SSH_USER` | secret | Yes | Phase G, step 25 |
    | `VPS_SSH_KEY` | secret | Yes | Phase G, step 26 |
    | `DOCKER_NETWORK` | variable | No — one per environment | Phase E, step 18 |

## Phase I — Run it end to end

30. Commit and push the `feat/coolify-deploy` branch — nothing on it has
    been pushed yet.
31. In GitHub's Actions tab, open **Deploy backend (Coolify)** and use **Run
    workflow**, selecting the `feat/coolify-deploy` branch.

    > The `push` trigger only watches `dev`/`main` — `workflow_dispatch` is
    > how you test from a feature branch without merging first.

32. Watch the run: image build & push to GHCR → SSH migration step →
    Coolify webhook call.
33. In Coolify, check the app's deployment log — confirm the new container
    passed its health check and swapped in.
34. Hit the health endpoint directly and confirm it responds.

    ```bash
    curl https://aromavitae-api.yourdomain.com/health
    # → {"data":{"status":"ok","timestamp":"..."}}
    ```

35. Once confirmed, merge `feat/coolify-deploy` into `dev` to make this the
    real staging path, then repeat for `main` when you're ready to cut
    production over from Render.

## Two SSH identities, kept separate

- **Your personal SSH access** (Phase A, step 3) — for you to administer the
  server directly: installing Coolify, running `docker login` once,
  debugging, maintenance. Has `sudo`.
- **GitHub Actions' SSH access** (Phase G) — a separate, narrower key used
  only by the automated workflow's migration step. Docker-group only, no
  `sudo` — if it ever leaks, the blast radius is "can run containers," not
  "can do anything root can do."

Day-to-day, deployment is fully automated through GitHub and needs no manual
SSH step:

```
git push origin dev  →  GitHub Actions builds image, pushes to GHCR,
                         SSHes in (its own key) to run migrations,
                         calls Coolify's webhook  →  Coolify swaps the container
```
