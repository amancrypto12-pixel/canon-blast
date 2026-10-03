# 04 — TELEGRAM MINI APP SPEC

## 1. Setup
1. @BotFather → `/newbot` → bot token.
2. `/newapp` (ya `/mybots` → Bot Settings → Menu Button) → Web App URL = hosted game URL (HTTPS mandatory).
3. Set short name → game link `t.me/<bot>/<app>`.

## 2. Loading SDK
`index.html` (Godot export ke custom HTML shell) me:
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```
Startup:
```js
const tg = window.Telegram.WebApp;
tg.ready(); tg.expand();
tg.disableVerticalSwipes && tg.disableVerticalSwipes();  // swipe-to-close roko
tg.setHeaderColor('#0D0F17'); tg.setBackgroundColor('#0D0F17');
```

## 3. Godot ↔ JS bridge
```gdscript
# autoload/Telegram.gd
var tg
func _ready():
    if OS.has_feature("web"):
        tg = JavaScriptBridge.get_interface("Telegram").WebApp
func get_init_data() -> String:
    return tg.initData if tg else ""
func haptic(kind: String):   # "light","medium","heavy"
    if tg: tg.HapticFeedback.impactOccurred(kind)
func open_invoice(url: String, cb: Callable):
    var js_cb = JavaScriptBridge.create_callback(func(args): cb.call(args[0]))
    tg.openInvoice(url, js_cb)
```
Keep references to JS callbacks in a member var (GC issue).

## 4. Auth (server-side, mandatory)
Client sends `initData` string in header `X-Telegram-Init-Data`. Server:
1. Parse query string, remove `hash`, sort remaining `key=value` by key, join with `\n`.
2. `secret = HMAC_SHA256(key="WebAppData", msg=BOT_TOKEN)`.
3. `calc = HMAC_SHA256(key=secret, msg=data_check_string)` hex.
4. Compare with `hash` (constant-time). Check `auth_date` not older than 24h.
5. User from `user` JSON field → upsert `users.tg_id`.
Issue short-lived JWT (1h) after validation.

## 5. Payments — Telegram Stars (XTR)
- Server: `createInvoiceLink` with `currency: "XTR"`, `provider_token: ""`, `prices: [{label, amount}]`, `payload: order_id`.
- Client: `tg.openInvoice(link, cb)` → status `paid|cancelled|failed|pending`.
- Bot webhook: handle `pre_checkout_query` → answer `ok` within 10s; handle `successful_payment` → credit Stars/pass **only here** (not on client callback).
- Store `telegram_payment_charge_id` for refunds; idempotent credit.
- UI: "PAYMENT CANCELLED" toast on `cancelled`.
Star packs: 75 / 500 / 1000 / 5000 / 10000 (in-game ⭐ amounts; map to XTR prices server config).

## 6. Features used
| Feature | API |
|---|---|
| Haptics | `HapticFeedback.impactOccurred/notificationOccurred` |
| Safe area | `tg.safeAreaInset`, `tg.contentSafeAreaInset` + `safeAreaChanged` event |
| Share/referral | `t.me/<bot>/<app>?startapp=ref_<id>` + `initDataUnsafe.start_param` |
| Share story | `tg.shareToStory(url, params)` |
| Close confirm | `tg.enableClosingConfirmation()` during hatch/purchase |
| Back button | `tg.BackButton` for sub-screens |
| Cloud storage (optional) | `tg.CloudStorage` for small settings |
| Open links | `tg.openTelegramLink`, `tg.openLink` |

## 7. Bot messages (push)
- "🐬 Your dolphin finished breeding!"
- "🔥 Hot Market is live!"
- "🎁 Daily pass ready"
Use `sendMessage` with inline button `web_app` URL. Respect user opt-in; max 2/day.

## 8. Referral
`startapp=ref_<tg_id>` → on first login create `referrals` row → reward both after referee reaches Lv2 dolphin (anti-fraud).

## 9. Compliance
- Privacy/ToS links in bot description.
- No real-money withdraw in v1. NFT/token = "coming soon".
- Age gate not required but avoid gambling-style paid-random without odds disclosure → **show wheel/pearl drop rates** in an info (i) popup.
