# 05 — TECH STACK

## 1. Stack
| Layer | Choice |
|---|---|
| Client | Godot 4.3+ (GDScript), Compatibility renderer, Web export (single-thread) |
| Backend | Node.js 20 + Fastify (TypeScript) |
| DB | PostgreSQL 16 |
| Cache/queues | Redis 7 (market FIFO, rate-limit, timers) |
| Jobs | BullMQ (breeding complete push, daily reset, tournaments) |
| Realtime | WebSocket (hot market, tournament) via `@fastify/websocket` |
| Hosting | Client: Cloudflare Pages/Netlify; API: VPS/Fly.io/Railway |
| Payments | Telegram Stars |
| Analytics | PostHog / GameAnalytics |
| Errors | Sentry |

## 2. Godot project structure
```
res://
 ├─ autoload/ Events.gd GameState.gd Api.gd Telegram.gd Audio.gd Clock.gd Save.gd
 ├─ data/ dolphins.json pearls.json collections.json wheel.json tasks.json passes.json gods.json
 ├─ scenes/
 │   ├─ shell/ Main.tscn TopBar.tscn BottomNav.tscn Toast.tscn ModalHost.tscn
 │   ├─ dolphins/ DolphinsScreen.tscn DolphinCard.tscn SlotRow.tscn BreedBar.tscn BreedPopup.tscn
 │   ├─ pearls/ PearlBoard.tscn Pearl.tscn PearlQueue.tscn
 │   ├─ market/ MarketScreen.tscn HotCard.tscn PriceChart.tscn Trader.tscn
 │   ├─ gods/ GodsScreen.tscn GodCard.tscn
 │   ├─ tasks/ TasksScreen.tscn TaskRow.tscn
 │   ├─ wheel/ Wheel.tscn
 │   ├─ collections/ Collections.tscn CollectionCard.tscn CollectionDetail.tscn
 │   └─ pod/ wallet/ pass/
 ├─ ui/ theme.tres fonts/ styleboxes/ icons/
 ├─ fx/ confetti.tscn ring.tscn splash.tscn hearts.tscn shine.gdshader glow.gdshader
 └─ art/ dolphins/ pearls/ skins/ gods/ bg/
```

## 3. Client rules
- Signal bus `Events.gd` (fish_changed, stars_changed, dolphin_fed, breeding_started, pearl_merged, reward_claimed, tab_changed).
- All balance numbers from JSON/Resource, never hard-coded.
- Client = view + optimistic UI; server confirms. Rollback on error.
- Timers: show countdown from server `ready_at`; sync `server_time_offset` at login.
- Object pooling for particles/floating text.
- Atlas textures ≤2048, WebP, OGG audio 96kbps. Initial load < 25 MB.
- `Engine.max_fps=60` (30 in battery mode).

## 4. DB schema (Postgres)
```sql
users(id bigserial pk, tg_id bigint unique, name text, created_at, last_seen, pass_tier text, pass_until timestamptz, ref_by bigint);
wallets(user_id pk fk, fish numeric, stars bigint, dlp numeric(18,4), hearts bigint, shells bigint, wheel_tokens int, wave_unc int, wave_rare int);
dolphins(id uuid pk, user_id fk, skin_id text, rarity text, level int, feeds int, breed_progress int, state text, slot int, feed_reset_at timestamptz, breed_ready_at timestamptz, staked_until timestamptz, created_at);
pearl_boards(user_id pk, grid jsonb, locked jsonb, queue jsonb, combo int, updated_at);
collections_progress(user_id, collection_id, added jsonb, claimed bool, primary key(user_id, collection_id));
collection_prizes(collection_id, prize_no, total int, claimed int);
market_listings(id uuid pk, seller_id fk, dolphin_id fk, rarity text, price_fish numeric, price_stars int, created_at, status text);
market_prices(rarity text pk, fish numeric, stars int, updated_at);
tasks_progress(user_id, task_id, progress int, claimed bool, day date);
gods(id uuid pk, user_id fk, type text, size text, level int, slots jsonb);
pods(id pk, name, power, members int); pod_members(pod_id, user_id, role);
payments(id uuid pk, user_id fk, charge_id text unique, xtr int, payload text, status text, created_at);
transactions(id bigserial pk, user_id, currency text, delta numeric, reason text, ref text, created_at);  -- ledger
```
Every currency change goes through `transactions` (audit + anti-cheat).

## 5. REST API (all under /v1, JWT)
| Method | Path | Purpose |
|---|---|---|
| POST | /auth/telegram | validate initData → JWT + full state |
| GET | /state | wallet, dolphins, board, tasks |
| POST | /dolphins/:id/feed | feed |
| POST | /dolphins/:id/breed | start breeding (partner pick) |
| POST | /dolphins/:id/booster | apply booster |
| POST | /dolphins/:id/stake | stake |
| POST | /breeding/:id/claim | collect pearls |
| POST | /pearls/place | {cell} place queue pearl, returns merges/combo/hatch |
| POST | /wheel/spin | {mega?} → result |
| GET | /collections | list + progress |
| POST | /collections/:id/add | {dolphin_id} feed and add |
| POST | /collections/:id/claim | prize |
| GET | /market/hot | current hot listing |
| POST | /market/buy | {listing_id, currency} |
| POST | /market/sell | list dolphin |
| GET | /market/prices | chart data |
| POST | /trader/rules | smart sell/buy |
| GET | /tasks | tasks + progress |
| POST | /tasks/:id/claim | claim |
| POST | /pass/invoice | create Stars invoice |
| POST | /shop/invoice | star pack invoice |
| GET/POST | /pod/* | pod list/join/create |
| POST | /bot/webhook | Telegram updates |
WS: `/ws` → `market.hot`, `tournament.rank`.

## 6. Idempotency & concurrency
`Idempotency-Key` header on claims/buys. DB transactions + `SELECT ... FOR UPDATE` on wallet rows. Redis lock per user for place/feed bursts.

## 7. Scheduled jobs
- Daily reset 00:00 UTC (tasks, daily pass).
- Breeding done → bot push.
- Weekly tournament close → rewards.
- Market price drift tick every 60s.

## 8. Testing
GUT (Godot unit test) for merge algorithm; Vitest for server; k6 for load (target 500 rps).
