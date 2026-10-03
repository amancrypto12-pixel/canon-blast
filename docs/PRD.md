# Product Requirement Document (PRD) — Telegram WebApp Game

## 1. Project Overview & Vision
A production-grade, 1:1 visual and mechanical replication of the viral Telegram Idle / Merge / Breeding game (**Duck My Duck** paradigm), themed around **Dolphin Pearls**. The game combines fast-paced tap-to-feed loops, a 12-tier egg merge matrix, automated staking, multi-character breeding rituals, and a FIFO single-queue market order book with live TON Web3 / Star monetization.

---

## 2. Core Game Loop & Mechanics

### 2.1 Primary Loop: Tap to Feed & Yield Mining
- **Currency System**:
  - **Blue Token Coin (`🪙 / 💠`)**: Primary on-chain/game yield token.
  - **Fish (`🐟`)**: Primary consumable energy / food resource (Tap cost: `144 🐟` per feed).
  - **Stars (`⭐`)**: Telegram Stars premium currency used for VIP passes, instant boosters, and exclusive chest unlocks.
  - **Love Hearts (`❤️`)**: Breeding energy consumed during incubation rituals (Cost: `5 ❤️` per breeding).
- **Yield Calculation**:
  - Base tap reward: `+0.02 Blue Tokens` per feed action.
  - Floating combo animations display simultaneously on tap: `+0.02` (green) and `-144 🐟` (amber).
  - Daily stamina limit with real-time countdown timer (`RESET IN HH:MM:SS`).

---

### 2.2 12-Tier Egg Matrix & Merge Evolution
- **Matrix Layout**: Interactive merge tray supporting up to 12 evolutionary tiers.
- **Egg Asset Categories**:
  - **Heart Eggs (12 Tiers)**: `heart_egg_lvl1.png` through `heart_egg_lvl12.png`.
  - **Pearl Eggs (12 Tiers)**: `pearl_egg_lvl1.png` through `pearl_egg_lvl12.png`.
- **Hatch Rates & Rarity**:
  - Common (Tiers 1–3)
  - Rare (Tiers 4–6)
  - Epic (Tiers 7–9)
  - Legendary / Mythic (Tiers 10–12)

---

### 2.3 Character Mascot & RPG Progression
- **12 Character Evolution Ranks**:
  - Consistent visual art style featuring evolving gear (Adventurer, Sailor, Captain, Cyber, Mystic, Golden Overlord).
- **Character Trio Stats**:
  - **Left Chip**: `DUCKER PASS` / `DAILY PASS 5 DAYS`
  - **Center Badge**: `LVL 5` + `~ COMMON` (glowing emerald badge)
  - **Right Chip**: `60.9K` / `/ 2,000` (Yield rate and storage limit)

---

### 2.4 Rituals & Modal Systems
1. **Daily Pack (`📦 PACK`)**:
   - Chest unlocking animation granting +10,000 Fish, +5 Love Hearts, and bonus Relic Eggs.
2. **Breeding Nest (`💖 BREED 5/5`)**:
   - Pairing heroes to incubate eggs with dynamic wobble and shell-crack animations.
3. **VIP Pass (`⭐ VIP DUCKER`)**:
   - 14-day Telegram Stars activation unlocking 2x stamina, 2x luck, auto-trader bot, and golden profile badge.
4. **Staking Engine (`⚡ STAKE`)**:
   - Instant lock/unlock into the Totem system for passive hourly Blue Token yield.

---

### 2.5 Market & Economy (FIFO Single-Queue)
- Dynamic order queue with instant liquidity matching and slippage protection.
- Slotted collections tray with reward multi-claim mechanisms.

---

## 3. Platform & Target Specifications
- **Target Platform**: Telegram Mini Apps (TMA) on iOS, Android, and Desktop.
- **SDK**: Telegram WebApp SDK v7.0+ (`initDataUnsafe`, HapticFeedback, Expand/Ready).
- **Hosting & CI/CD**: Automatic push to GitHub repository (`https://github.com/amancrypto12-pixel/canon-blast`) triggering Vercel instant deployment.
