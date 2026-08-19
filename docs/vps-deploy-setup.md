# VPS Deploy Setup — Aromavitae Backend

End-to-end steps for taking a bare 2 vCPU / 4GB Linux VPS to a working run of
[`.github/workflows/backend-coolify.yml`](../.github/workflows/backend-coolify.yml).
Do the phases in order — each one depends on values (IPs, keys, webhook URLs)
produced by the phase before it.

**Scope**: this VPS hosts the backend API, its shared Postgres, and Garage
(self-hosted S3-compatible object storage) only. The frontend stays on
Vercel — [`frontend.yml`](../.github/workflows/frontend.yml) is unaffected by
anything here.

Throughout this doc, `$DOMAIN` is the domain you point at the VPS (e.g.
`example.com`) and `$NODE` is a short label for this box (e.g. `vps1`) —
used in Garage's subdomains so a future second node doesn't collide with
this one. Substitute your real values wherever you see `$DOMAIN` / `$NODE`.

**Coolify shortcut**: every `docker exec <container> ...` command below
(Postgres in Phase D, Garage in Phase E) can be run instead from Coolify's
UI — open the resource → **Terminal** tab, which drops you straight into a
shell inside that container. That skips SSH entirely and you don't need to
look up the container name first; just drop the `docker exec <container>`
prefix and run the rest of the command as shown.

## Subdomain plan

Set these up as A records in Phase B, all pointing at the VPS's public IP:

| Subdomain | Purpose |
|---|---|
| `vps.$DOMAIN` | SSH access to the box itself — `ssh ubuntu@vps.$DOMAIN` instead of the raw IP |
| `coolify.$DOMAIN` | Coolify dashboard |
| `aromavitae-api.$DOMAIN` | Backend API — production |
| `aromavitae-api-dev.$DOMAIN` | Backend API — dev (set up later, only when needed) |
| `s3-$NODE.$DOMAIN` | Garage's S3 API endpoint (shared by every bucket — path-style) |
| `aromavitae-media.web-$NODE.$DOMAIN` | Garage's public web endpoint — production bucket |
| `aromavitae-media-dev.web-$NODE.$DOMAIN` | Garage's public web endpoint — dev bucket (later) |

Garage's S3 API is used **path-style** (`s3.ts` sets `forcePathStyle: true`),
so one subdomain covers every bucket. Its *web* (public GET) endpoint is
virtual-hosted-style instead, so each bucket needs its own subdomain — see
Phase E. Garage's RPC (3901) and admin (3903) ports are never exposed
publicly; they're reached with `docker exec`.

## Phase A — Provision & harden the VPS

1. Provision the VPS — 2 vCPU / 4GB RAM, **Ubuntu 24.04 LTS** (what
   Coolify's install script targets). 4GB is tight for Coolify + Postgres +
   Garage + the Node app together, so add swap as a safety margin:

   ```bash
   fallocate -l 4G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```

2. Note the VPS's public IP — you'll reuse it in Phase B.
3. Most providers hand you a pre-made `ubuntu` cloud-init user instead of
   direct root login — already in `sudo`, already trusting your SSH key. If
   that's what you have, there's no user to create; just confirm it works
   and lock the box down from there:

   ```bash
   ssh ubuntu@<vps-ip>
   sudo -v   # confirms passwordless sudo — should not prompt for a password
   ```

   > Before you continue: disable password auth and root login so the box
   > isn't sitting open to credential-stuffing bots the moment it's
   > reachable. Do this **after** confirming key-based login as `ubuntu`
   > works, not before — otherwise a broken key locks you out with no
   > password fallback.

   ```bash
   sudo sed -i \
     -e 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' \
     -e 's/^#\?PermitRootLogin.*/PermitRootLogin no/' \
     /etc/ssh/sshd_config

   sudo systemctl restart sshd
   ```

   Every later step that says "SSH in" means `ssh ubuntu@<vps-ip>` with
   `sudo` in front of privileged commands. (If your provider gave you root
   only, with no pre-made user, then create one the traditional way instead:
   `adduser ubuntu && usermod -aG sudo ubuntu && rsync --archive
   --chown=ubuntu:ubuntu ~/.ssh /home/ubuntu`, then apply the same
   `sshd_config` hardening above.) `deploy` in Phase G is a different,
   narrower user created later just for CI — not this one.

4. Install and enable the firewall — allow SSH, HTTP/HTTPS, and Coolify's
   setup port. Do **not** open 3901 (Garage RPC) or 3903 (Garage admin) —
   they're only reached from inside the box.

   ```bash
   ufw allow 22
   ufw allow 80
   ufw allow 443
   ufw allow 8000   # temporary — Coolify's first-run screen
   ufw enable
   ```

## Phase B — Point DNS at the box

5. Add the A records from the subdomain plan above, all → the VPS IP.
   Garage bucket subdomains (the last two rows) can be added now or later,
   one per bucket, whenever you create a new bucket — see Phase E.

## Phase C — Install Coolify

6. Run Coolify's official install script over SSH on the VPS, logged in as
   `ubuntu`. The script needs root to install Docker and set up its
   services — since `ubuntu` is the only login now (root SSH is disabled),
   pipe it through `sudo`, not plain `bash`:

   ```bash
   ssh ubuntu@<vps-ip> "curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash"
   ```

7. Open the Coolify UI at `http://<vps-ip>:8000` and create the admin
   account.
8. In Coolify's settings, set its own dashboard domain to
   `coolify.$DOMAIN` and let it issue a Let's Encrypt certificate through
   its built-in proxy. Once that's confirmed working, you can close port
   8000 in `ufw` (`ufw delete allow 8000`).

## Phase D — Shared Postgres

No Supabase anywhere in this stack — auth and file storage are handled by
the backend app itself (bcrypt + JWT, and Garage), backed by one shared
Postgres. See "Two things replaced Supabase" below for why.

9. Create a Coolify Project called **`core`** — this holds only the shared,
   platform-level Postgres and Garage, not any single app's resources.
10. In `core`, add a plain **PostgreSQL Database** resource (not a bundled
    "service" template) — this is `core-postgres`, the one Postgres server
    every project's database will live on.
11. Create production's database and a dedicated role for it — not the
    Postgres resource's own root/superuser, so a leaked app password can
    only reach this one database. Exec into the container (find its name
    with `docker ps --format '{{.Names}}' | grep postgres`), and check
    Coolify's Configuration tab for the actual root username first (usually
    `postgres`, but confirm rather than assume):

    ```bash
    docker exec -it <postgres-container> psql -U postgres -c \
      "CREATE ROLE aromavitae WITH LOGIN PASSWORD '<generate with: openssl rand -hex 24>';"

    docker exec -it <postgres-container> psql -U postgres -c \
      "CREATE DATABASE aromavitae OWNER aromavitae;"
    ```

    That gives `DATABASE_URL=postgresql://aromavitae:<password>@core-postgres:5432/aromavitae`
    for Phase F. Only add a **dev** database/environment when you actually
    need one — same pattern, with `_dev` names throughout (role
    `aromavitae_dev`, database `aromavitae_dev`) instead of duplicating
    everything up front.

    > If you're pasting these into an already-open `psql` session (e.g. via
    > Coolify's Terminal tab) rather than through `docker exec -c`, the
    > password **must** be wrapped in single quotes — without them Postgres
    > tries to parse it as a numeric literal and errors with `trailing junk
    > after numeric literal` the moment it starts with a digit. If a broken
    > paste leaves the prompt stuck on `postgres-#` (a continuation prompt,
    > meaning it's still waiting on an unclosed quote), clear it with `';`
    > or `Ctrl+C` before retyping the statement.
12. Note `core-postgres`'s internal Docker hostname and the Docker network
    it's on — the backend app needs both (Phase F, Phase I).

## Phase E — Install Garage (self-hosted object storage)

13. In the `core` project, add a new **Docker Compose** resource for
    Garage. Use a config close to:

    ```yaml
    services:
      garage:
        image: dxflrs/garage:v1.0.1
        restart: unless-stopped
        volumes:
          - garage_meta:/var/lib/garage/meta
          - garage_data:/var/lib/garage/data
          - ./garage.toml:/etc/garage.toml
        ports:
          - "3900:3900"   # S3 API
          - "3902:3902"   # public web endpoint
          # 3901 (RPC) and 3903 (admin) intentionally not published

    volumes:
      garage_meta:
      garage_data:
    ```

    and mount `garage.toml` (Coolify's "File" storage feature lets you
    define file contents directly, no need to SSH in to write it):

    ```toml
    metadata_dir = "/var/lib/garage/meta"
    data_dir = "/var/lib/garage/data"
    db_engine = "sqlite"

    replication_factor = 1   # single node — raise this only if you add more Garage nodes

    rpc_bind_addr = "[::]:3901"
    rpc_public_addr = "127.0.0.1:3901"
    rpc_secret = "<openssl rand -hex 32>"

    [s3_api]
    s3_region = "garage"
    api_bind_addr = "[::]:3900"
    root_domain = ".s3-NODE.DOMAIN"     # replace with your real s3-$NODE.$DOMAIN

    [s3_web]
    bind_addr = "[::]:3902"
    root_domain = ".web-NODE.DOMAIN"    # replace with your real web-$NODE.$DOMAIN
    index = "index.html"

    [admin]
    api_bind_addr = "[::]:3903"
    admin_token = "<openssl rand -hex 32>"
    metrics_token = "<openssl rand -hex 32>"
    ```

    Generate the two secrets with `openssl rand -hex 32` and keep them
    somewhere safe — you won't need `admin_token` again unless you script
    against Garage's admin API later.

14. In Coolify, set the domain for the container's **3900** port to
    `s3-$NODE.$DOMAIN`. Leave 3901/3903 with no domain.
15. Deploy the resource, then find the container name and initialize the
    single-node layout:

    ```bash
    docker ps --format '{{.Names}}' | grep garage   # note as <garage-container>

    docker exec <garage-container> /garage node id -q
    # → prints <node-id>@<ip>:3901 — use just <node-id> below

    docker exec <garage-container> /garage layout assign -z dc1 -c 10G <node-id>
    docker exec <garage-container> /garage layout apply --version 1
    ```

    Adjust `-c 10G` to whatever share of the VPS's disk you want Garage to
    use — leave headroom for Postgres and Docker images.

16. Create the production bucket, enable public web serving on it, and
    create a dedicated access key scoped to just that bucket:

    ```bash
    docker exec <garage-container> /garage bucket create aromavitae-media
    docker exec <garage-container> /garage bucket website --allow aromavitae-media
    docker exec <garage-container> /garage key create aromavitae-prod
    docker exec <garage-container> /garage bucket allow --read --write --key aromavitae-prod aromavitae-media

    # get the access key id + secret — you'll need these in Phase F
    docker exec <garage-container> /garage key info aromavitae-prod --show-secret
    ```

    Only add a **dev** bucket/key when you actually need one — same
    pattern, with `aromavitae-media-dev` / `aromavitae-dev` names instead
    of duplicating everything up front. See the README's
    ["One-time VPS setup for a new bucket"](../README.md#one-time-vps-setup-for-a-new-bucket)
    for the short version of this sequence.

17. In Coolify, add a domain for the bucket, pointed at the same
    container's **3902** port:
    - `aromavitae-media.web-$NODE.$DOMAIN`

    Verify from your laptop — expect `HTTP/2 200` on a real object key, or a
    Garage "not found" JSON body (not a connection error or 403) if the
    bucket is empty so far:

    ```bash
    curl -I https://aromavitae-media.web-$NODE.$DOMAIN/
    ```

    Adding a bucket later follows this same create → `website --allow` →
    grant key → add Coolify domain sequence — see the README's
    ["One-time VPS setup for a new bucket"](../README.md#one-time-vps-setup-for-a-new-bucket)
    section for the short version.

## Phase F — Deploy the backend app

18. Create a Coolify Project called **`aromavitae`** and add a new
    **Docker Compose** resource for production (same resource type as
    Garage in Phase E — no build happens here, it just runs the image
    `backend-coolify.yml` already built and pushed to GHCR). Add a second,
    `dev` resource the same way later, only once you actually need one.
    Paste in [`deploy/docker-compose.prod.yml`](../deploy/docker-compose.prod.yml):

    ```yaml
    services:
      api:
        image: ghcr.io/lunor-labs/aromavitae-backend:latest
        restart: unless-stopped
        environment:
          DATABASE_URL: ${DATABASE_URL}
          ADMIN_JWT_SECRET: ${ADMIN_JWT_SECRET}
          S3_ENDPOINT: ${S3_ENDPOINT}
          S3_REGION: ${S3_REGION}
          S3_BUCKET: ${S3_BUCKET}
          S3_ACCESS_KEY_ID: ${S3_ACCESS_KEY_ID}
          S3_SECRET_ACCESS_KEY: ${S3_SECRET_ACCESS_KEY}
          S3_PUBLIC_URL: ${S3_PUBLIC_URL}
          FRONTEND_URL: ${FRONTEND_URL}
          NODE_ENV: production
          LOG_LEVEL: info
          PORT: 4000
        ports:
          - "4000:4000"
    ```

    A future `dev` resource points the `image:` line at the `:dev` tag
    instead of `:latest`.

19. Set the actual values in Coolify's **Environment Variables** tab for
    this resource (not hardcoded in the compose file above — Coolify
    substitutes `${VAR}` references in the compose file from whatever's set
    there at deploy time):

    ```
    DATABASE_URL              # postgresql://aromavitae:<password>@core-postgres:5432/aromavitae
    ADMIN_JWT_SECRET          # random 32+ char string — same value goes on the Vercel frontend for this environment
    S3_ENDPOINT               # https://s3-$NODE.$DOMAIN
    S3_REGION                 # garage                    — matches garage.toml's s3_api.s3_region
    S3_BUCKET                 # aromavitae-media
    S3_ACCESS_KEY_ID          # from `garage key info aromavitae-prod`
    S3_SECRET_ACCESS_KEY      # from the same command
    S3_PUBLIC_URL             # https://aromavitae-media.web-$NODE.$DOMAIN
    FRONTEND_URL
    ```

    These map directly to [`api/src/config/env.ts`](../api/src/config/env.ts) — that's
    the source of truth if the schema changes later. A future `dev`
    resource uses the `aromavitae_dev` database/role and
    `aromavitae-media-dev` bucket/key from Phases D and E instead.

20. In Coolify, set the domain for the `api` service's **4000** port to
    `aromavitae-api.$DOMAIN` (a future `dev` resource: `aromavitae-api-dev.$DOMAIN`) —
    same per-port domain assignment as Garage in Phase E.
21. Attach the resource to the same Docker network as `core-postgres` so
    `DATABASE_URL` can resolve it by hostname. Note that network's name —
    it becomes the `DOCKER_NETWORK` GitHub variable in Phase I. (It doesn't
    need network access to Garage: presigning an S3 URL is a local HMAC
    computation, not a network call — only the browser's subsequent `PUT`
    actually talks to Garage, over the public `S3_ENDPOINT`.)
22. Under Coolify's Registries settings, add GHCR credentials — a GitHub PAT
    scoped to `read:packages` — so Coolify can pull the private image.
23. `backend-coolify.yml`'s last step hits Coolify's **API deploy
    endpoint** via `POST`, not the resource's own "Webhook" URL (that one's
    for git-connected auto-deploy and doesn't apply to an image/Compose
    resource with no connected repo). Build the URL from the resource's
    UUID, visible in Coolify's address bar while viewing it
    (`.../application/<uuid>`):

    ```
    https://coolify.$DOMAIN/api/v1/deploy?uuid=<resource-uuid>
    ```

    Verify it manually first:

    ```bash
    curl -fsS -X POST "https://coolify.$DOMAIN/api/v1/deploy?uuid=<resource-uuid>" \
      -H "Authorization: Bearer <COOLIFY_API_TOKEN>"
    ```

    Once that queues a deployment instead of erroring, that full URL
    becomes the `COOLIFY_DEPLOY_WEBHOOK` secret for the `prod` GitHub
    environment in Phase I.
24. On the frontend (Vercel), for the production environment set
    `NEXT_PUBLIC_API_URL` (the backend's domain), `NEXT_PUBLIC_ASSET_BASE_URL`
    (= `S3_PUBLIC_URL` above), and `ADMIN_JWT_SECRET` (the exact same value
    as the backend's).
25. Create the first admin account, run from anywhere with network access
    to Postgres:
    ```bash
    DATABASE_URL=<aromavitae DATABASE_URL> \
      npm --prefix api run create-admin -- --email you@aromavitae.com --password '...'
    ```

### Two things replaced Supabase

- **Auth**: `AdminUser` table (bcrypt password hash) + a JWT the backend
  signs/verifies itself (`api/src/lib/auth.ts`). The frontend stores the
  token in a plain (non-httpOnly) cookie so both `middleware.ts` (via `jose`,
  edge-compatible) and client-side API calls can use it — same trust model
  the old Supabase session token had.
- **Storage**: signed S3 `PutObjectCommand` URLs (`api/src/services/UploadService.ts`)
  against Garage, instead of Supabase Storage's signed upload URLs.
  Functionally a drop-in swap — the frontend still does a plain
  `fetch(uploadUrl, { method: "PUT" })`.

## Phase G — Give CI its own SSH access

26. Generate a dedicated keypair for CI, on your laptop — don't reuse your
    personal one. A leaked CI key should only ever be able to run
    containers, nothing more, which is what the rest of this phase enforces.

    ```bash
    ssh-keygen -t ed25519 -f ~/.ssh/coolify-ci-deploy -C "github-actions" -N ""
    ```

27. On the VPS, create a `deploy` user with **no password login at all**
    (SSH key only) and **not** in `sudo`:

    ```bash
    ssh ubuntu@<vps-ip> "sudo adduser --disabled-password --gecos '' deploy && \
      sudo mkdir -p /home/deploy/.ssh && \
      sudo chmod 700 /home/deploy/.ssh && \
      sudo chown deploy:deploy /home/deploy/.ssh"
    ```

28. Attach the CI key to `deploy` by appending its public half into
    `deploy`'s own `authorized_keys` — every user has a separate one of
    these, so this is what scopes the key to `deploy` specifically rather
    than `ubuntu`. `sudo` is required because `ubuntu` has no write access
    into `deploy`'s (mode-700) home directory:

    ```bash
    cat ~/.ssh/coolify-ci-deploy.pub | ssh ubuntu@<vps-ip> \
      "sudo tee -a /home/deploy/.ssh/authorized_keys > /dev/null"

    ssh ubuntu@<vps-ip> "sudo chmod 600 /home/deploy/.ssh/authorized_keys && \
      sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys"
    ```

29. Verify, then add `deploy` to the `docker` group — only possible now that
    Coolify's install script (Phase C) has created that group:

    ```bash
    ssh -i ~/.ssh/coolify-ci-deploy deploy@<vps-ip>   # logs in, no password
    # whoami       → deploy
    # sudo -v      → should FAIL, deploy has no sudo — that's by design

    ssh ubuntu@<vps-ip> "sudo usermod -aG docker deploy"
    ```

30. Keep the **private** half (`~/.ssh/coolify-ci-deploy`) — it becomes the
    `VPS_SSH_KEY` GitHub secret; `deploy` becomes `VPS_SSH_USER`.

## Phase H — Authenticate `deploy` to GHCR

31. Log `deploy` itself into GHCR — this is a per-user credential
    (`~/.docker/config.json`), not daemon-wide, and separate from Coolify's
    own registry credentials (Phase F, step 22). It's specifically what lets
    the migration step's `docker run ghcr.io/...` — which
    `backend-coolify.yml` runs over SSH as `deploy` — pull the private
    image. Logging in as `ubuntu` instead does **not** cover this; that's
    a different user's Docker config.

    ```bash
    ssh -i ~/.ssh/coolify-ci-deploy deploy@<vps-ip> \
      "docker login ghcr.io -u <github-username> -p <PAT with read:packages>"
    ```

## Phase I — Configure GitHub

32. Settings → Actions → General → Workflow permissions → set **Read and
    write permissions**. Without this, `GITHUB_TOKEN` can't push to GHCR.
33. Settings → Environments — create **`prod`** for now (add **`dev`** later,
    only when you set up that second app). These exact names matter:
    [`backend-coolify.yml`](../.github/workflows/backend-coolify.yml) and
    [`frontend.yml`](../.github/workflows/frontend.yml) both select the
    environment as `main → prod`, everything else `→ dev`.
34. Generate a Coolify API token (your profile/team → API Tokens in the
    Coolify UI) — this authorizes the deploy-webhook call in the workflow's
    last step. One token works for both environments, prod and dev alike.
35. Add the secrets and variables below to the `prod` environment (repeat
    for `dev`, with that environment's own values, once it exists):

    | Name | Kind | Same across environments? | Where it came from |
    |---|---|---|---|
    | `COOLIFY_DEPLOY_WEBHOOK` | secret | No — one per environment | Phase F, step 23 |
    | `COOLIFY_API_TOKEN` | secret | Yes | Phase I, step 34 |
    | `DATABASE_URL` | secret | No — one per environment | Phase D, step 11 |
    | `VPS_HOST` | secret | Yes | Phase A, step 2 |
    | `VPS_SSH_USER` | secret | Yes | Phase G, step 27 (`deploy`) |
    | `VPS_SSH_KEY` | secret | Yes | Phase G, step 30 |
    | `DOCKER_NETWORK` | variable | Yes (same network for both apps) | Phase F, step 21 |

## Phase J — Run it end to end

36. Since only `prod` is set up so far, push to `main` (or use **Run
    workflow** in GitHub's Actions tab — `workflow_dispatch` — to test from
    a feature branch first without merging). This triggers
    `backend-coolify.yml` against the `prod` environment: image build &
    push to GHCR → SSH migration step → Coolify webhook call.
37. In Coolify, check the app's deployment log — confirm the new container
    passed its health check and swapped in.
38. Hit the health endpoint directly and confirm it responds.

    ```bash
    curl https://aromavitae-api.$DOMAIN/health
    # → {"data":{"status":"ok","timestamp":"..."}}
    ```

39. When you set up the `dev` app/environment later (Phases D–I, `_dev`
    naming throughout), repeat this same sequence pushing to `dev` instead,
    checking `aromavitae-api-dev.$DOMAIN`.

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
