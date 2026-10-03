# Project Operational Rules & Standards

## 1. Core Development Rules

### Rule 1: Strict 1:1 Parity Standard
- Every UI element, font size, spacing, color token, and animation must match the provided reference screenshots and documents exactly.
- **No Unrequested Buttons**: Do not add developer settings, debug menus, or unapproved widgets.
- Clean, focused interface adhering to the Duck My Duck reference hierarchy.

### Rule 2: Asset Integrity
- All in-game sprites must be transparent PNGs (`.png`) without black/white bounding boxes or background cards unless specified.
- Use only approved user-provided assets:
  - Blue Token Coin (`blue_token_coin.png`)
  - User Fish (`icon_user_fish.png`)
  - User Stars (`icon_user_star.png`)
  - 12 Heart Eggs (`heart_egg_lvl1.png` to `heart_egg_lvl12.png`)
  - 12 Pearl Eggs (`pearl_egg_lvl1.png` to `pearl_egg_lvl12.png`)

### Rule 3: Git & Deployment Discipline
- Every single modification must be synced between `public/index.html` and root `index.html`.
- All changes must be committed and immediately pushed to the remote GitHub repository:
  - Repo: `https://github.com/amancrypto12-pixel/canon-blast`
  - Branch: `main`
- Credentials must never be logged or inlined in output (keep `[REDACTED]`).

### Rule 4: Telegram SDK Compliance
- Must support Telegram WebApp SDK v7.0+ seamlessly:
  - Dynamically load user avatar from `user.photo_url`.
  - Trigger proper haptic feedback on all tap, hatch, and claim actions.
  - Expand view on load (`Telegram.WebApp.expand()`).

---

## 2. Code Quality & Performance Guidelines
- Pure vanilla HTML5/CSS3/ES6+ for zero build-step overhead and instant edge loading.
- Synthesize all UI sound effects via WebAudio API — zero external mp3 network latency.
- Responsive design constrained to standard mobile viewports (`360px` to `430px` width) with `viewport-fit=cover`.
