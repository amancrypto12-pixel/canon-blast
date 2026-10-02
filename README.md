# 🧌 Goblin Clan — Telegram Mini App & Bot

A complete, production-grade Telegram WebApp game built on the exact mechanics of **"Duck My Duck"** with a fantasy **Goblin Clan** theme.

---

## 🎮 Core Game Systems (5 Tabs)

1. **🧌 Goblins Tab (Core Feeding & Breeding Loop):**
   * **5 Rarity Tiers:** Common (1x), Uncommon (4x), Rare (16x), Epic (50x), Legendary (160x yield).
   * **Tap-to-Feed:** Consumes Mushrooms 🍄 & Energy ⚡, earns $GOB tokens & fills the Level progress bar.
   * **Automated Staking:** Level 5 max goblins automatically mine passive $GOB tokens 24/7.
   * **Breeding Ritual (2/5 limit):** Hatch higher-tier goblins using ❤️ Hearts.
   * **Flock Roster:** Seamless carousel to switch between active clan goblins.

2. **🥚 Eggs Tab (7×7 Relic Merge Grid):**
   * **49-Slot Board:** Drag/tap to merge matching tier eggs to evolve them (T1 to T5) and earn ❤️ Hearts.
   * **Auto-Merge:** 1-tap instant merge tool.

3. **🗿 Gods Tab (Prestige Totems):**
   * **3 Ancient Totems:** God of Plunder (Greed 💰), Goddess of Fertility (Breeding Luck 🥚), Totem of Frenzy (War ⚡).
   * Upgrade totems to gain permanent account-wide multipliers.

4. **🏪 Market Tab (Live Trading & VIP Pass):**
   * Dynamic pricing with **+15% demand surge**.
   * **Chieftain VIP Pass (299 ⭐):** Turbo 20/s Auto-feed, Smart Trader Bot, 2x Daily Mushrooms, Ad-Skip.

5. **📜 Tasks Tab (2-Level Referrals & Clan Sabotage):**
   * **2-Tier Viral Referrals:** +1,000 🍄 per friend (+5,000 for Premium) + 10% Tier-1 & 2.5% Tier-2 passive earnings.
   * **Clan Sabotage & Raids:** Attack rival packs (Orc Horde, Shadow Daggers) every 4h to steal mushrooms & gain clan rating.

---

## 🚀 Setup & Telegram Bot Integration

### 1. Run the Local Backend Server
```bash
cd goblin-pro-game
pip install aiohttp
python3 server.py
```
Server runs at `http://localhost:8080` (serves both REST API and Mini App).

### 2. Connect to Telegram BotFather
1. Go to [@BotFather](https://t.me/BotFather) on Telegram.
2. Create your bot with `/newbot`.
3. Type `/newapp` ➔ Select your bot ➔ Provide title & description.
4. Set Web App URL to your hosted server link (e.g. `https://your-domain.com`).
5. Set the Menu Button via `/setmenubutton` so users can launch the game directly from chat!

### 3. Run the Bot Script
```bash
export TELEGRAM_BOT_TOKEN="your_bot_token_from_botfather"
export WEBAPP_URL="https://your-hosted-domain.com"
python3 bot.py
```
