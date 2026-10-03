# 09 — TODO (phase-wise)

Legend: [ ] todo, [x] done. Estimates for solo dev.

## Phase 0 — Setup (Week 1)
- [ ] Repo: `/client` (Godot), `/server` (Node TS), `/docs`
- [ ] Godot project: 720×1600, canvas_items/expand, Compatibility renderer, theme.tres from UI tokens
- [ ] Autoloads: Events, GameState, Api, Telegram, Audio, Clock
- [ ] Placeholder assets generator (colored rects w/ labels)
- [ ] Server skeleton: Fastify, Postgres migrations, Redis, Docker compose
- [ ] Telegram bot created, test WebApp URL, initData validation endpoint

## Phase 1 — Shell + Dolphins (Weeks 2–3)
- [ ] Main shell: TopBar, BottomNav (5 tabs, badges), Toast, ModalHost
- [ ] Dolphins screen: DLP counter, side chips, DolphinCard (5 rarity frames, states)
- [ ] Slot row (11 dots) + swipe between dolphins
- [ ] Feed tap: cost, float text, squash, bubbles, haptic, server feed endpoint
- [ ] Level/feeds progress bar + "RESET IN" timer
- [ ] DLP passive tick + count-up
- [ ] Save/load via API (`/auth/telegram`, `/state`)

## Phase 2 — Breeding + Pearl board (Weeks 4–6)
- [ ] Breed popup (partner, fee, boosters 6/12/24h)
- [ ] Breeding state + timer + notifications job
- [ ] Pearl queue + 7×7 board + locked corners
- [ ] Merge algorithm (client mirror + server authoritative) + GUT tests
- [ ] Merge FX: slide, flash, scale pop, confetti, ring, combo badge X, chain pitch
- [ ] Hint system, board-full handling, free chest timer
- [ ] Hatch sequence (shake, crack, flash, dolphin jump, rarity banner, fly to slot)
- [ ] Shells + tournament basic ranking

## Phase 3 — Meta systems (Weeks 7–9)
- [ ] Tide Wheel (server result, spin anim, popup, fly to HUD) + Mega x10
- [ ] Instant Merge (Wave points)
- [ ] Collections list/detail, Feed and Add, ADDED stamp, prize pool counters, Top Collectors
- [ ] Tasks hub with all tabs (Tasks, Challenges, Achievements, Hearts, Social, Ads, Group…)
- [ ] Daily/Dive bonus ladder, Energy panel, Rewards Unlocked popup
- [ ] Reef Pass popup + perks applied server-side
- [ ] Pod (join/create, perks)

## Phase 4 — Market + Gods + Payments (Weeks 10–12)
- [ ] Market: hot listing, bid timer, buy Fish/Stars, price engine, chart, FIFO queue
- [ ] My Market + Dolphin Trader (VIP) rules
- [ ] WebSocket live market
- [ ] Gods screen (sizes, stats, slots, level) — UNLOCK flow
- [ ] Stars payments: invoice, pre_checkout, successful_payment, star packs, pass purchase
- [ ] Wallet screen (soon states)
- [ ] Referral via startapp param

## Phase 5 — Polish (Weeks 13–14)
- [ ] Full VFX pass (list in 02 §8), shaders (shine, glow), legendary aura
- [ ] Audio pass (25 SFX + BGM), mute/animations toggles
- [ ] FTUE 8-step tutorial with spotlight
- [ ] Safe areas, back button, closing confirmation
- [ ] Performance: atlases, particle budget, low-end test, bundle < 25 MB
- [ ] Drop-rate info popups
- [ ] Localization hooks (EN + Hindi/RU optional)

## Phase 6 — Launch (Week 15+)
- [ ] CI/CD (GitHub Actions → Cloudflare Pages + API)
- [ ] Analytics + Sentry + dashboards
- [ ] Load test 500 rps, anti-cheat review, economy sim (faucet vs sink)
- [ ] Soft launch 500–1000 users, tune [DES] numbers
- [ ] Live-ops calendar: daily reset, weekly tournament, monthly collection

## Open decisions (owner to answer)
- [ ] Merge mode: match-3 (default) or merge-2
- [ ] Token/NFT: in-game only (default) or real
- [ ] Payments: Telegram Stars only (default)
- [ ] Launch collections count (default 6×24)
- [ ] Breeding partners: bots in v1 (default) or real players

## Backlog
Pod boss, PvP duels, season pass, on-chain withdraw, Ocean God NFT mint, more collections, achievements v2.
