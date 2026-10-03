# Project Memory & Knowledge Base

## 1. Project Context & Background
- **Project Name**: Dolphin Pearls (Duck My Duck 1:1 Parity WebApp)
- **Target Repository**: `https://github.com/amancrypto12-pixel/canon-blast`
- **Deployment Platform**: Vercel Edge (auto-triggered on git push to `main`)
- **Hosting URL**: Live Telegram Mini App WebApp URL connected to Telegram Bot

---

## 2. Key Architecture Decisions & Lessons Learned
1. **Vercel Root Deployment vs Public Folder**:
   - Vercel static site deployments look for root `index.html` by default.
   - Standard: Maintain both `/public/index.html` and `/index.html` in sync, backed by `vercel.json` rewrite routing.
2. **Asset Transparency & UI Parity**:
   - User strictly requires transparent PNG sprites without dark background cards or white bounding boxes.
   - Resource pills in header and center balance must not have dark container boxes.
   - Font sizes must match reference: Balance (`38px`), Action (`16px`), Header Numbers (`14px`).
3. **Telegram User Avatar Hydration**:
   - Standard retrieval via `window.Telegram.WebApp.initDataUnsafe.user`.
   - Priority: `user.photo_url` -> Fallback: Capital initial letter avatar circle.
4. **Procedural WebAudio Synthesis**:
   - Eliminates external asset loading times and cross-origin audio blocks on mobile Safari/Telegram webviews.

---

## 3. Asset Registry
| Asset Filename | Category | Source / Description |
| :--- | :--- | :--- |
| `blue_token_coin.png` | Currency | User provided 3D blue token |
| `icon_user_fish.png` | Currency | User provided tap energy resource |
| `icon_user_star.png` | Currency | User provided Telegram Stars currency |
| `dolphin_hero_stage.png` | Mascot | Main centered dolphin hero |
| `dolphin_hero_icon.png` | Navigation | Dock icon for hero tab |
| `heart_egg_lvl[1-12].png`| Egg Assets | 12 tiers from `heart.zip` |
| `pearl_egg_lvl[1-12].png`| Egg Assets | 12 tiers from `pearls.zip` |
| `pack_chest.png` | Modals | Daily pack reward chest |
| `breeding_nest.png` | Modals | Incubation nest stage |
| `vip_crown_3d.png` | Modals | VIP Ducker Pass emblem |
| `dock_*.png` | Navigation | Market, Gods, Tasks tab icons |
