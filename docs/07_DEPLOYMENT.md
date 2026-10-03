# 07 — DEPLOYMENT

## 1. Godot web export
1. Godot 4.3+ → Project → Export → Add **Web**.
2. Install export templates (Editor → Manage Export Templates).
3. Options:
   - Thread Support: **OFF** (single-thread; Telegram WebView par SharedArrayBuffer/COOP-COEP headers ki zarurat nahi).
   - Export type: Regular. VRAM texture compression: ✔ (ETC2/ASTC for mobile).
   - Custom HTML shell: `export/shell.html` (Telegram SDK script + loading screen + safe-area CSS).
4. Export → `build/web/` (index.html, .wasm, .pck, .js).
5. Renderer: **Compatibility** (WebGL2).
6. Size tips: strip unused modules (custom template build), WebP textures, brotli on server.

### shell.html essentials
```html
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>html,body{margin:0;background:#0D0F17;height:100%;overflow:hidden;touch-action:none}</style>
```
Loading screen: logo shine + progress bar (Godot `$GODOT_PROGRESS`).

## 2. Hosting (client)
| Option | Notes |
|---|---|
| Cloudflare Pages | free, HTTPS, brotli, CDN — recommended |
| Netlify / Vercel | easy |
| VPS + Nginx | full control |
Headers: `Cache-Control: public,max-age=31536000,immutable` for .wasm/.pck (hashed names), `no-cache` for index.html. MIME: `.wasm` = `application/wasm`.

## 3. Backend deploy
- Docker compose: `api`, `postgres`, `redis`, `worker`.
- Env: `BOT_TOKEN`, `JWT_SECRET`, `DATABASE_URL`, `REDIS_URL`, `WEBAPP_URL`, `SENTRY_DSN`.
- Reverse proxy: Caddy/Nginx with HTTPS (Let's Encrypt). WebSocket upgrade enabled.
- Bot webhook: `https://api.domain.com/v1/bot/webhook` via `setWebhook` (secret_token set).
- Postgres daily backup (pg_dump → S3), Redis AOF on.

## 4. Telegram connect
1. BotFather `/newapp` → URL = Cloudflare Pages domain.
2. Set menu button: `/setmenubutton` → web app.
3. Test: open `t.me/<bot>/<app>` on Android + iOS + Desktop.
4. Test environment: BotFather test servers ya `?tgWebAppDebug` via Telegram Desktop → enable WebView debugging (Settings → Advanced → Experimental → Enable webview inspection).

## 5. CI/CD (GitHub Actions)
```yaml
name: build
on: { push: { branches: [main] } }
jobs:
  web:
    runs-on: ubuntu-latest
    container: barichello/godot-ci:4.3
    steps:
      - uses: actions/checkout@v4
      - run: mkdir -p build/web && godot --headless --export-release "Web" build/web/index.html
      - uses: cloudflare/wrangler-action@v3
        with: { apiToken: ${{ secrets.CF_TOKEN }}, accountId: ${{ secrets.CF_ACCOUNT }}, command: pages deploy build/web --project-name=dolphin-pearl }
  api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd server && npm ci && npm test && docker build -t dolphin-api .
```

## 6. Environments
`dev` (local + test bot), `staging` (test bot, staging DB), `prod`. Separate bot tokens per env.

## 7. Release checklist
- [ ] initData validation on every request
- [ ] Rate limits on
- [ ] Drop rates info popup (wheel/pearls)
- [ ] Privacy policy + ToS URLs
- [ ] Load test 500 rps passed
- [ ] Android low-end (2GB RAM) 30+ fps
- [ ] Back button/closing confirmation tested
- [ ] Stars payment end-to-end (pre_checkout → successful_payment)
- [ ] Backups + monitoring alerts
- [ ] Analytics events firing

## 8. Monitoring
Sentry (client JS + server), uptime check, DB slow query log, economy dashboard (fish faucet vs sink daily, Stars revenue, market price drift).
