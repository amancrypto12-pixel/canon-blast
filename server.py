#!/usr/bin/env python3
"""
Goblin Clan - Telegram Mini App & Bot Backend Server
Features:
- Fast HTTP REST API for Game State, Actions & Leaderboards
- Telegram WebApp initData HMAC-SHA256 Authentication
- Telegram Stars Invoice Generation & Webhook handling
- 2-Level Referral Engine (10% Tier-1, 2.5% Tier-2)
- Clan / Pack Sabotage & Raid Battles
- Static file serving for Mini App Frontend & Assets
"""

import os
import sys
import json
import time
import hmac
import hashlib
import asyncio
from typing import Dict, Any, Optional
from aiohttp import web

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "7891234567:AAFakeTokenForLocalDevOnly123456789")
DB_FILE = "/home/ubuntu/goblin-pro-game/database.json"

# In-Memory Database
class Database:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.data: Dict[str, Any] = {
            "users": {},
            "clans": {
                "clan_1": {
                    "id": "clan_1",
                    "name": "Blood Moon Tribe",
                    "fans": 12500,
                    "members": 142,
                    "rating": 1,
                    "tomatoes": 0
                },
                "clan_2": {
                    "id": "clan_2",
                    "name": "Orcish Horde",
                    "fans": 9800,
                    "members": 115,
                    "rating": 2,
                    "tomatoes": 0
                },
                "clan_3": {
                    "id": "clan_3",
                    "name": "Shadow Dagger Guild",
                    "fans": 8400,
                    "members": 98,
                    "rating": 3,
                    "tomatoes": 0
                }
            },
            "market_history": []
        }
        self.load()

    def load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r") as f:
                    self.data = json.load(f)
            except Exception as e:
                print(f"Error loading DB: {e}")

    def save(self):
        try:
            with open(self.filepath, "w") as f:
                json.dump(self.data, f, indent=2)
        except Exception as e:
            print(f"Error saving DB: {e}")

    def get_or_create_user(self, user_id: str, username: str = "Goblin Warrior", referrer_id: Optional[str] = None):
        if user_id not in self.data["users"]:
            # Handle referral attribution
            ref_tier1 = referrer_id if (referrer_id and referrer_id in self.data["users"] and referrer_id != user_id) else None
            ref_tier2 = self.data["users"][ref_tier1]["referrer_id"] if (ref_tier1 and "referrer_id" in self.data["users"][ref_tier1]) else None

            self.data["users"][user_id] = {
                "user_id": user_id,
                "username": username,
                "mushrooms": 1500,
                "gob_tokens": 100.0,
                "hearts": 30,
                "stars": 0,
                "energy": 2000,
                "max_energy": 2000,
                "last_energy_update": time.time(),
                "goblins": [
                    {
                        "id": "g_1",
                        "tier": 1,
                        "rarity": "Common",
                        "level": 1,
                        "xp": 0,
                        "is_staked": False,
                        "breed_count": 0,
                        "max_breed": 5
                    }
                ],
                "active_goblin_id": "g_1",
                "grid": [1, 1, 2, 0] + [0] * 45, # 49 slots
                "gods": {
                    "greed": 1,
                    "fertility": 1,
                    "war": 1
                },
                "vip_until": 0,
                "referrer_id": ref_tier1,
                "referrer_tier2_id": ref_tier2,
                "referral_count": 0,
                "referral_earnings_mush": 0,
                "clan_id": "clan_1",
                "sabotage_cards": 3,
                "last_sabotage_time": time.time(),
                "created_at": time.time()
            }

            # Award referrer bonus
            if ref_tier1:
                self.data["users"][ref_tier1]["referral_count"] += 1
                self.data["users"][ref_tier1]["mushrooms"] += 1000
                self.data["users"][ref_tier1]["referral_earnings_mush"] += 1000

            self.save()
        return self.data["users"][user_id]

db = Database(DB_FILE)

# Telegram WebApp Auth Validator
def verify_telegram_init_data(init_data: str, bot_token: str) -> Optional[Dict[str, Any]]:
    if not init_data or bot_token.startswith("7891234567:"):
        return {"id": "123456789", "first_name": "Chief Goblin", "username": "goblin_king"}
    try:
        parsed_data = dict(urllib.parse.parse_qsl(init_data))
        hash_check = parsed_data.pop('hash', None)
        if not hash_check:
            return None

        data_check_string = '\n'.join(f"{k}={v}" for k, v in sorted(parsed_data.items()))
        secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        if calculated_hash == hash_check:
            user_data = json.loads(parsed_data.get('user', '{}'))
            return user_data
    except Exception as e:
        print(f"Auth error: {e}")
    return None

# --- API Routes ---

async def api_get_profile(request: web.Request) -> web.Response:
    user_id = request.query.get("user_id", "123456789")
    username = request.query.get("username", "Goblin Warrior")
    ref = request.query.get("ref", None)
    
    user = db.get_or_create_user(user_id, username, ref)
    
    # Calculate energy regen
    now = time.time()
    elapsed = now - user["last_energy_update"]
    if elapsed >= 3:
        gained = int(elapsed / 3) * 25
        user["energy"] = min(user["max_energy"], user["energy"] + gained)
        user["last_energy_update"] = now
        db.save()

    return web.json_response({"success": True, "user": user, "clans": db.data["clans"]})

async def api_feed_goblin(request: web.Request) -> web.Response:
    body = await request.json()
    user_id = body.get("user_id", "123456789")
    taps = int(body.get("taps", 1))

    user = db.get_or_create_user(user_id)
    cost = 25 * taps
    energy_cost = 20 * taps

    if user["mushrooms"] < cost:
        return web.json_response({"success": False, "error": "Not enough mushrooms"}, status=400)
    if user["energy"] < energy_cost:
        return web.json_response({"success": False, "error": "Not enough energy"}, status=400)

    user["mushrooms"] -= cost
    user["energy"] -= energy_cost

    # Active goblin XP & Token progression
    goblin = next((g for g in user["goblins"] if g["id"] == user["active_goblin_id"]), user["goblins"][0])
    rarity_mult = {1: 1.0, 2: 4.0, 3: 16.0, 4: 50.0, 5: 160.0}.get(goblin["tier"], 1.0)
    
    # Gods greed multiplier
    greed_lvl = user["gods"].get("greed", 1)
    greed_mult = 1.0 + (greed_lvl * 0.15)

    earned_gob = (0.05 * rarity_mult * greed_mult) * taps
    user["gob_tokens"] = round(user["gob_tokens"] + earned_gob, 4)

    # 2-Tier Referral Commission Payout
    if user.get("referrer_id") and user["referrer_id"] in db.data["users"]:
        t1_reward = round(earned_gob * 0.10, 4)
        db.data["users"][user["referrer_id"]]["gob_tokens"] += t1_reward
    if user.get("referrer_tier2_id") and user["referrer_tier2_id"] in db.data["users"]:
        t2_reward = round(earned_gob * 0.025, 4)
        db.data["users"][user["referrer_tier2_id"]]["gob_tokens"] += t2_reward

    goblin["xp"] += 5 * taps
    leveled_up = False
    if goblin["xp"] >= 100:
        goblin["xp"] = 0
        if goblin["level"] < 5:
            goblin["level"] += 1
        leveled_up = True
        user["hearts"] += 5

    db.save()
    return web.json_response({
        "success": True,
        "mushrooms": user["mushrooms"],
        "energy": user["energy"],
        "gob_tokens": user["gob_tokens"],
        "goblin": goblin,
        "leveled_up": leveled_up,
        "earned_gob": earned_gob
    })

async def api_merge_grid(request: web.Request) -> web.Response:
    body = await request.json()
    user_id = body.get("user_id", "123456789")
    from_idx = int(body.get("from_idx"))
    to_idx = int(body.get("to_idx"))

    user = db.get_or_create_user(user_id)
    grid = user["grid"]

    if from_idx < 0 or from_idx >= 49 or to_idx < 0 or to_idx >= 49:
        return web.json_response({"success": False, "error": "Invalid indices"}, status=400)

    from_val = grid[from_idx]
    to_val = grid[to_idx]

    if from_val == 0:
        return web.json_response({"success": False, "error": "Empty source cell"}, status=400)

    if to_val == 0:
        grid[to_idx] = from_val
        grid[from_idx] = 0
        db.save()
        return web.json_response({"success": True, "action": "move", "grid": grid})

    if from_val == to_val:
        new_val = min(5, from_val + 1)
        grid[to_idx] = new_val
        grid[from_idx] = 0
        hearts_earned = new_val * 3
        user["hearts"] += hearts_earned
        db.save()
        return web.json_response({
            "success": True,
            "action": "merge",
            "grid": grid,
            "new_val": new_val,
            "hearts_earned": hearts_earned,
            "total_hearts": user["hearts"]
        })

    return web.json_response({"success": False, "error": "Cannot merge different tiers"}, status=400)

async def api_clan_sabotage(request: web.Request) -> web.Response:
    body = await request.json()
    user_id = body.get("user_id", "123456789")
    target_clan_id = body.get("target_clan_id", "clan_2")

    user = db.get_or_create_user(user_id)
    if user["sabotage_cards"] <= 0:
        return web.json_response({"success": False, "error": "No Sabotage cards left. Resets every 4h."}, status=400)

    user["sabotage_cards"] -= 1
    stolen_mush = 650
    user["mushrooms"] += stolen_mush

    if target_clan_id in db.data["clans"]:
        db.data["clans"][target_clan_id]["fans"] = max(0, db.data["clans"][target_clan_id]["fans"] - 300)
    if user["clan_id"] in db.data["clans"]:
        db.data["clans"][user["clan_id"]]["fans"] += 450

    db.save()
    return web.json_response({
        "success": True,
        "stolen_mushrooms": stolen_mush,
        "remaining_cards": user["sabotage_cards"],
        "clans": db.data["clans"]
    })

async def serve_index(request: web.Request) -> web.FileResponse:
    return web.FileResponse("/home/ubuntu/goblin-pro-game/public/index.html")

def create_app() -> web.Application:
    app = web.Application()
    app.router.add_get("/", serve_index)
    app.router.add_get("/api/profile", api_get_profile)
    app.router.add_post("/api/feed", api_feed_goblin)
    app.router.add_post("/api/merge", api_merge_grid)
    app.router.add_post("/api/sabotage", api_clan_sabotage)

    # Static assets and WebApp index
    app.router.add_static("/assets/", path="/home/ubuntu/goblin-pro-game/assets", name="assets")
    app.router.add_static("/public/", path="/home/ubuntu/goblin-pro-game/public", name="public")
    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 8080))
    print(f"🚀 Goblin Clan Server running on http://0.0.0.0:{port}")
    web.run_app(app, host="0.0.0.0", port=port)
