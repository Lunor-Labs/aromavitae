# VPS Deploy Setup — Aromavitae

End-to-end steps for taking a bare 2 vCPU / 4GB Linux VPS to a working run of
[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).
Do the phases in order — each one depends on values (IPs, keys, webhook URLs)
produced by the phase before it.

**Scope**: this VPS hosts the whole app — one Next.js server that serves the
site and the Payload admin at `/admin` — plus the shared Postgres and Garage
(self-hosted S3-compatible object storage) it uses.

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
| the site's own domain (`ceylonaromavitae.lk`, `www.ceylonaromavitae.lk`) | The app — site and `/admin` — production |
| `s3-$NODE.$DOMAIN` | Garage's S3 API endpoint (shared by every bucket — path-style) |
| `aromavitae-media.web-$NODE.$DOMAIN` | Garage's public web endpoint — production bucket |
| `aromavitae-media-dev.web-$NODE.$DOMAIN` | Garage's public web endpoint — dev bucket (later) |

Garage's S3 API is used **path-style** (`payload/payload.config.ts` sets `forcePathStyle: true`),
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
   `sshd_config` hardening above.)

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

No Supabase anywhere in this stack — admin logins are Payload's own `users`
collection and files go to Garage, all backed by one shared Postgres.

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
      "CREATE ROLE aromavitae_payload WITH LOGIN PASSWORD '<generate with: openssl rand -hex 24>';"

    docker exec -it <postgres-container> psql -U postgres -c \
      "CREATE DATABASE aromavitae_payload OWNER aromavitae_payload;"
    ```

    That gives `DATABASE_URI=postgresql://aromavitae_payload:<password>@<postgres-host>:5432/aromavitae_payload`
    for Phase F. Payload creates the tables itself: `npm run migrate`, or
    automatically when the production container starts. Only add a **dev** database/environment when you actually
    need one — same pattern, with `_dev` names throughout (role
    `aromavitae_payload_dev`, database `aromavitae_payload_dev`) instead of duplicating
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
    it's on — the app needs both (Phase F).

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

## Phase F — Deploy the app

18. Create a Coolify Project called **`aromavitae`** and add a new
    **Docker Compose** resource for production (no build happens on the
    VPS — it runs the image `deploy.yml` already built and pushed to GHCR).
    Paste in [`deploy/docker-compose.prod.yml`](../deploy/docker-compose.prod.yml).

19. Set the actual values in Coolify's **Environment Variables** tab for
    this resource (Coolify substitutes the `${VAR}` references in the
    compose file from there at deploy time):

    ```
    DATABASE_URI              # postgresql://aromavitae_payload:<password>@<postgres-host>:5432/aromavitae_payload
    PAYLOAD_SECRET            # same value as in your local .env — a different one logs everyone out
    SERVER_URL                # https://ceylonaromavitae.lk  (no trailing slash; the site's public URL)
    S3_ENDPOINT               # https://s3.lunorlabs.com
    S3_REGION                 # garage
    S3_BUCKET                 # aromavitae
    S3_ACCESS_KEY_ID          # same as local .env
    S3_SECRET_ACCESS_KEY      # same as local .env
    ```

    `SERVER_URL` is read when the container starts, so changing it (for
    example from a temporary test domain to the real one) only needs a
    restart, not a new build. `NEXT_PUBLIC_ASSET_BASE_URL` is not set here:
    it's baked into the image at build time (Phase G).

20. Set the domain(s) for the `web` service's **3000** port, e.g.
    `https://ceylonaromavitae.lk:3000,https://www.ceylonaromavitae.lk:3000`.
    Coolify issues the certificate once DNS points at the VPS.
21. Attach the resource to the same Docker network as the Postgres database
    so `DATABASE_URI` can reach it by its internal hostname. It doesn't need
    a private route to Garage: uploads go to the public `S3_ENDPOINT`.
22. Under Coolify's Registries settings, add GHCR credentials — a GitHub PAT
    scoped to `read:packages` — so Coolify can pull the private image.
23. `deploy.yml`'s last step calls Coolify's **API deploy endpoint**. Build
    the URL from the resource's UUID, visible in Coolify's address bar while
    viewing it:

    ```
    https://coolify.$DOMAIN/api/v1/deploy?uuid=<resource-uuid>
    ```

    Generate a Coolify API token (Keys & Tokens → API tokens, with deploy
    permission) and verify the call manually first:

    ```bash
    curl -fsS -X POST "https://coolify.$DOMAIN/api/v1/deploy?uuid=<resource-uuid>" \
      -H "Authorization: Bearer <COOLIFY_API_TOKEN>"
    ```

    Once that queues a deployment instead of erroring, the URL and token
    become GitHub secrets in Phase G.

## Phase G — Configure GitHub

24. Settings → Actions → General → Workflow permissions → set **Read and
    write permissions**. Without this, `GITHUB_TOKEN` can't push to GHCR.
25. Settings → Environments — create **`prod`** (the name `deploy.yml` uses)
    and add:

    | Name | Kind | Value |
    |---|---|---|
    | `NEXT_PUBLIC_ASSET_BASE_URL` | variable | Garage's public web URL for the bucket (same as local `.env`) |
    | `COOLIFY_DEPLOY_WEBHOOK` | secret | Phase F, step 23 |
    | `COOLIFY_API_TOKEN` | secret | Phase F, step 23 |

    No database or SSH secrets: CI never talks to the VPS except through
    Coolify's API, and migrations run inside the new container when it starts.

## Phase H — Run it end to end

26. Push to `main` (or use **Run workflow** on `deploy.yml` in GitHub's
    Actions tab). The workflow lints, typechecks, builds and pushes the
    image to GHCR, then asks Coolify to deploy it.
27. In Coolify, check the deployment log — the container should start,
    apply any pending migration, and pass its health check
    (`/admin/login`).
28. Open the site and `/admin`, log in, and edit something small to confirm
    saving and image upload work.

Day-to-day:

```
git push origin main  →  GitHub Actions builds the image, pushes it to GHCR,
                          calls Coolify's deploy API  →  Coolify pulls it and
                          swaps the container (pending migrations run on start)
```
