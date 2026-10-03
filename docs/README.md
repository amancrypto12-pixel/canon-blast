# 🐬 Dolphin Pearl — Spec Pack

Telegram Mini App idle + merge + breeding game. Reference mechanics: "Duck My Duck".
Theme: Duck → **Dolphin**, Egg → **Pearl**, Corn → **Fish**, Pack → **Pod**.
Engine: **Godot 4.x (HTML5 export)** | Backend: **Node.js + Postgres + Redis** | Platform: **Telegram Mini App**

## Is zip me kya hai

| File | Kaam |
|---|---|
| `01_GAME_SPEC.md` | Game concept, loops, entities, currencies, rarity, content list |
| `02_UI_SPEC.md` | Har screen ka layout, colors, fonts, components, animations |
| `03_GAMEPLAY_SPEC.md` | Feed, breeding, pearl merge, wheel, collections, market ke exact rules + formulas |
| `04_TELEGRAM_SPEC.md` | Telegram WebApp SDK, initData auth, Stars payment, haptics, bot |
| `05_TECH_STACK.md` | Godot project structure, backend, DB schema, API list |
| `06_ASSET_SPEC.md` | Saare art/audio assets ki list, size, naming, AI prompts |
| `07_DEPLOYMENT.md` | Godot web export, hosting, BotFather, CI |
| `08_AI_AGENT_INSTRUCTIONS.md` | AI coding agent (Claude Code / Cursor) ke liye rules |
| `09_TODO.md` | Phase-wise checklist |
| `docs/DOLPHIN_PEARL_GDD_full.md` | Pehle bana hua full detailed GDD (reference) |

## Padhne ka order
1. `01` → `03` (game samjho)
2. `02` + `06` (UI aur assets)
3. `04` + `05` + `07` (tech)
4. `08` + `09` (build shuru)

## Tumhare paas jo assets hain
Blue eye-wing logo, gradient star, blue fish, dolphin happy, dolphin smug → `06_ASSET_SPEC.md` me inka mapping hai.

## Important notes
- Mechanics follow karo, par original game ka art/naam/text/icons copy mat karo (copyright/trade dress risk).
- Jo cheezein video me confirm nahi thi wo specs me **[DESIGN]** mark hain — numbers tune kar sakte ho.
- Economy server-authoritative rakho (client pe trust nahi).
