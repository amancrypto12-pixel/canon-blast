# Design Tokens & UI/UX Specification

## 1. Color Palette & Design Tokens

```css
:root {
  /* Backgrounds */
  --bg-main: #13121d;        /* Deep Obsidian Navy */
  --bg-card: #1c1b2a;        /* Card & Dock Base */
  --bg-card-sub: #161523;    /* Inner Chip Fill */

  /* Accents & Signals */
  --accent-green: #22c55e;   /* Emerald Gain / Active Tab / Feed Button */
  --accent-gold: #f59e0b;    /* Ducker Pass / Stars / Lvl Text */
  --accent-yellow: #fbbf24;  /* Fish Currency / Subtitle Highlights */
  --accent-red: #ef4444;     /* Warning / Cost Indicator */
  --accent-purple: #a855f7;  /* VIP Crown / Gods Accent */
  --accent-pink: #ec4899;    /* Love Hearts / Breeding Nest */
  --accent-blue: #38bdf8;    /* Blue Token / Yield Numbers */

  /* Typography Colors */
  --text-white: #ffffff;     /* Headers & Main Numbers */
  --text-muted: #8b92a5;     /* Subtitles / Secondary Labels */

  /* Borders */
  --border-dark: #2c2a42;
  --border-light: rgba(255, 255, 255, 0.08);
}
```

---

## 2. Typography Hierarchy
- **Primary Display Font**: `'Fredoka', sans-serif` (Weights: 600, 700, 800) — Used for large numeric balances, level chips, and action titles.
- **Interface Body Font**: `'Nunito', -apple-system, sans-serif` (Weights: 700, 800, 900) — Used for labels, badges, and modal body text.

---

## 3. Component Specs

### 3.1 Header
- **Left Cluster**:
  - Avatar: `22px` circle with 1px border (`rgba(255,255,255,0.2)`).
  - Username: `13px`, weight `800`.
  - Pack Button: `11px`, background `#1e1d2e`, border `#3c3a54`, color `#f59e0b`.
- **Right Cluster**:
  - Fish & Star Counters: `14px`, weight `900`, transparent background without bounding boxes.

### 3.2 Main Balance
- Token Coin: `36px` circular sprite with soft drop shadow (`rgba(14, 165, 233, 0.4)`).
- Token Value: `38px`, font `'Fredoka'`, weight `800`, text shadow.

### 3.3 Trio Stat Row
- **Left**: `DUCKER PASS` (11px gold), `DAILY PASS 5 DAYS` (9px muted).
- **Center**: `LVL 5` (14px gold), `~ COMMON` (9px emerald green pill with `rgba(34, 197, 94, 0.15)` fill).
- **Right**: `60.9K` (12px cyan), `/ 2,000` (9px muted).

### 3.4 Hero Stage & Action
- Stage: `250px` height with subtle radial glowing pedestal.
- Main Action Button: `FEED 144 🐟` with 4px 3D bottom border, `RESET IN 6:02:39` countdown subtitle.
- Dual Side Buttons: `💖 BREED 5/5` (Pink gradient) & `⚡ STAKE` (Purple gradient).

### 3.5 Bottom Dock
- Height: `60px` with frosted glass backdrop blur (`14px`).
- Tabs (5): `MARKET`, `EGGS`, `DUCKS` (Active Green), `GODS`, `TASKS`.
