# CopiPilot — aaPanel Production Deployment

Target: a fresh Ubuntu 22.04/24.04 VPS with **aaPanel**, **Node.js 22 LTS**, **PostgreSQL 16**,
**Nginx**, **PM2**. The app runs as a Node server on port **3400** behind Nginx (reverse proxy +
TLS).

---

## 1. Server prerequisites (aaPanel)

1. Install aaPanel, then in the App Store install:
   - **Node.js** (22.x LTS) — aaPanel's Node manager
   - **PostgreSQL** (16.x)
   - **Nginx**
2. Open firewall ports: `80`, `443`, `22`. **Do not** expose `3400` publicly.
3. Install build tools and pnpm:
   ```bash
   npm install -g pnpm
   ```

## 2. Database

Create a dedicated role and database (aaPanel → Database → Add Database, or psql):

```sql
CREATE ROLE copipilot LOGIN PASSWORD 'STRONG_DB_PASSWORD';
CREATE DATABASE copipilot OWNER copipilot;
```

## 3. Code + environment

```bash
cd /www/wwwroot
git clone <your-repo-url> copipilot
cd copipilot
pnpm install --frozen-lockfile
```

Create `.env` (copy from `.env.example`):

```env
DATABASE_URL="postgresql://copipilot:STRONG_DB_PASSWORD@127.0.0.1:5432/copipilot?schema=public"
AUTH_SECRET="<openssl rand -hex 32>"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

> `NEXT_PUBLIC_SITE_URL` must be the **public HTTPS** URL — it drives canonical URLs, sitemap,
> and reset links.

## 4. Migrate, seed, build

```bash
pnpm db:generate
pnpm db:deploy          # apply migrations (non-interactive)
pnpm db:seed            # idempotent demo content
pnpm build
```

The build statically prerenders several pages, so the DB must be reachable at build time.

**Immediately change the seeded demo passwords** (`admin@copipilot.com`, `client@copipilot.com` —
both `Work@3428`) via the admin Team module and the client settings page, or re-seed with
`ADMIN_PASSWORD` / `DEMO_USER_PASSWORD` env overrides.

## 5. Run under PM2

```bash
npm install -g pm2
pm2 start "pnpm start" --name copipilot --time
pm2 save
pm2 startup            # follow the printed command to enable boot persistence
```

Verify: `pm2 status` shows `online`; `curl -I http://127.0.0.1:3400` returns `200`.

## 6. Nginx reverse proxy (aaPanel)

aaPanel → Website → Add Site (`yourdomain.com`, PHP = none). Then replace the site's config
(`/www/server/panel/vhost/nginx/yourdomain.com.conf`) with:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate     /www/server/panel/vhost/cert/yourdomain.com/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/yourdomain.com/privkey.pem;

    client_max_body_size 20m;   # media uploads

    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;
    gzip_min_length 1024;

    location /_next/static/ {
        alias /www/wwwroot/copipilot/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3400;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }
}
```

Then **Enable SSL** (Let's Encrypt) in aaPanel for the domain.

## 7. Uploads directory

Uploads live under `public/uploads` (gitignored). Ensure the Node user can write:

```bash
chown -R www:www /www/wwwroot/copipilot/public/uploads
```

## 8. Post-deploy checklist

- [ ] Demo admin/client passwords changed.
- [ ] `AUTH_SECRET` is a fresh random 32-byte value.
- [ ] Firewall: only 22/80/443 open; `3400` not public.
- [ ] DB backups scheduled (aaPanel → Database → Backup, daily).
- [ ] `pm2 save` + `pm2 startup` done (survives reboot).
- [ ] Legal pages reviewed by counsel before taking real deposits.
- [ ] **Money is `Float` in the schema — migrate to `Decimal`/integer minor units before real
      money moves** (`prisma/schema.prisma` + `lib/finance.ts`).
- [ ] Rate limits are in-memory (per process) — fine for one PM2 instance; if you scale to
      multiple instances, move rate limiting to a shared store (Redis).

## 9. Updates

```bash
cd /www/wwwroot/copipilot
git pull
pnpm install --frozen-lockfile
pnpm db:deploy
pnpm build
pm2 restart copipilot
```