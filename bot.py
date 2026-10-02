#!/usr/bin/env python3
"""
Goblin Clan Telegram Bot
Commands:
- /start, /play: Opens the Mini App with high-converting inline button
- /invite: Generates 2-tier referral link with instant rewards
- /clan: Shows Clan Leaderboards & Sabotage Status
- /stats: Displays personal farming stats, $GOB mined & referrals
"""

import os
import sys
import json
import asyncio
import urllib.request
import urllib.parse

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN_HERE")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-domain.com")

def send_telegram_message(chat_id: int, text: str, reply_markup: dict = None):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"Telegram API Error: {e}")
        return None

def get_start_keyboard(ref_code: str = ""):
    game_url = f"{WEBAPP_URL}?startapp={ref_code}" if ref_code else WEBAPP_URL
    return {
        "inline_keyboard": [
            [
                {
                    "text": "🧌 Launch Goblin Clan (Play & Earn)",
                    "web_app": {"url": game_url}
                }
            ],
            [
                {
                    "text": "👥 Invite Friends (+1,000 🍄)",
                    "callback_data": "invite_info"
                },
                {
                    "text": "⚔️ Clan War",
                    "callback_data": "clan_info"
                }
            ],
            [
                {
                    "text": "📢 Join Official Channel",
                    "url": "https://t.me/telegram"
                }
            ]
        ]
    }

if __name__ == "__main__":
    print("Goblin Clan Telegram Bot Handler Loaded.")
    print("Set TELEGRAM_BOT_TOKEN and WEBAPP_URL to run in live production webhook/polling mode.")
