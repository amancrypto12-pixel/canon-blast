# 08 — AI AGENT INSTRUCTIONS

(For Claude Code / Cursor / any coding agent. Read this file first, then the specs.)

## Mission
Build **Dolphin Pearl**, a Telegram Mini App (idle + merge + breeding + collections + market) in **Godot 4.3+ (GDScript, HTML5 export)** with a **Node.js/TypeScript + Postgres + Redis** backend. Follow the specs in this folder exactly.

## Read order
1. `README.md`
2. `01_GAME_SPEC.md`, `03_GAMEPLAY_SPEC.md`
3. `02_UI_SPEC.md`, `06_ASSET_SPEC.md`
4. `04_TELEGRAM_SPEC.md`, `05_TECH_STACK.md`, `07_DEPLOYMENT.md`
5. `09_TODO.md` (work from here)
6. `docs/DOLPHIN_PEARL_GDD_full.md` only for extra detail.

## Hard rules
1. **Server-authoritative economy.** Client never sends balances or results. Server validates feed, breed, merge, wheel, market, claims. Wheel result chosen server-side before animation.
2. **Data-driven.** All numbers (costs, rates, weights, rewards) live in `data/*.json` (client) and server config. No magic numbers in scenes/scripts.
3. **One ledger.** Every currency change writes a `transactions` row.
4. **Idempotent claims.** Use `Idempotency-Key`; double tap must not double reward.
5. **Telegram auth** via initData HMAC on every request (see 04). Never trust `initDataUnsafe`.
6. **Credit payments only from `successful_payment`** bot update, never from client callback.
7. **Performance:** Compatibility renderer, atlas textures, pooled particles, ≤120 live particles, 60fps (30 battery mode), initial load <25 MB.
8. **UI exactness:** use tokens in `02_UI_SPEC.md` (colors, sizes, anim timings). No inline hex outside theme.
9. **Mobile first:** portrait 720×1600, touch targets ≥88px, safe areas respected.
10. **Do not copy the original game's art/names/text.** Use Dolphin Pearl names from the mapping table.
11. Show **drop rates** (info popup) for wheel and pearl/hatch odds.
12. No real-money withdraw or on-chain NFT in v1 — show "Coming soon".

## Coding conventions
- GDScript: static typing (`var x: int`), `class_name` for reusable nodes, signals via `Events.gd` bus, no `get_node` chains >2 levels (use `%UniqueName`).
- Scenes small and composable; one script per scene root.
- File names: scenes `PascalCase.tscn`, scripts match, assets `snake_case`.
- Server: TypeScript strict, Zod validation on all inputs, Fastify plugins per module, SQL via `pg` + migrations (node-pg-migrate).
- Tests: GUT for merge/economy math; Vitest for API; each PR adds tests for new rules.
- Commits: small, conventional (`feat:`, `fix:`, `chore:`).

## Workflow for each task
1. Pick next unchecked item in `09_TODO.md`.
2. State plan (files to touch) in 3–5 lines.
3. Implement + tests.
4. Run: Godot headless export check, `npm test`.
5. Tick the checkbox in `09_TODO.md`, note any deviation in `docs/DECISIONS.md`.

## Ask the human when
- A spec number is marked [DES] and balance feels off (propose, don't silently change).
- Assets are missing (use placeholders: colored rects with labels named per `06_ASSET_SPEC.md`).
- Legal/payment/token questions.

## Placeholders
If an art asset doesn't exist, create `res://art/_placeholder/<name>.png` (flat color + text label) and reference the final filename so swapping later is a file replace only.

## Definition of done (per feature)
- Matches spec numbers & animation timings
- Works offline-safe (graceful on API error: toast + rollback)
- Haptics + SFX hooked
- Analytics event fired (see `docs/DOLPHIN_PEARL_GDD_full.md` §27)
- Tested on low-end Android WebView (or throttled 4× CPU in Chrome)

## Key algorithms (reference)
Pearl merge (flood fill, chain, combo):
```gdscript
func place(cell: Vector2i, tier: int) -> Array:
    var events := []
    grid[cell] = tier
    while true:
        var group := _flood(cell, grid[cell])
        if group.size() < merge_min: break
        var t := grid[cell]
        var nt := mini(t + (2 if group.size() >= 5 else 1), MAX_TIER)
        for c in group: grid[c] = 0
        grid[cell] = nt
        combo += 1
        events.append({"group": group, "tier": nt, "combo": combo})
        if nt == MAX_TIER: events.append({"hatch": cell}); break
    return events
```
Server runs the same function and returns authoritative events; client only animates them.

DLP tick:
```
dlp_per_hour = base[rarity]*(1+0.15*(level-1))*pass*god*stake
```
