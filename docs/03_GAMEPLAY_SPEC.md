# 03 — GAMEPLAY SPEC (rules + formulas)

Tag: **[OBS]** = video me dikha, **[DES]** = proposed.

## 1. Feeding [OBS+DES]
- Tap card → deduct `feed_cost(rarity)` Fish, `feeds += 1`, DLP tick bonus, float `+value`.
- Level thresholds [DES]: Lv1→2: 5 feeds, 2→3: 8, 3→4: 12, 4→5: 18, Lv5 full: 25.
- `RESET IN hh:mm:ss`: feed window cooldown; after reset feeds can resume. [OBS]
- **Breed 5/5** unlocks when `breed_progress == 5` (5 successful feeds this cycle).
- Pass `turbo feed`: x2 feed per tap (Prince+).

## 2. DLP passive
```
dlp_per_hour = base[rarity] * (1 + 0.15*(level-1)) * pass_mult * god_mult * stake_mult
tick each second = sum(dlp_per_hour)/3600
```
pass_mult: none 1.0, Prince 1.05, King 1.10, VIP 1.15. stake_mult: 1.10–1.50.

## 3. Breeding [OBS+DES]
1. Open Breed popup → partner assigned (market/other player/bot) with `fee` Fish (e.g. 100).
2. State → `breeding`, `breed_ready_at = now + cooldown(rarity)`.
3. Boosters: 6h/12h/24h time-cut pills; hourglass variants = auto-repeat. Buy with Stars or task reward.
4. Complete → grant N pearls (N=3–5) into queue; 5% chance 1 Heart Pearl (Prince +5%, King +10%).
5. Partner owner earns fee. Parent feed counter resets.
6. During breeding card cannot be fed/sold/staked.

## 4. Pearl board [DES, visuals OBS]
- Grid 7×7, corners locked (unlock with Stars/tournament).
- Next pearl from queue placed on any empty unlocked cell.
- `merge_min = 3` (config; 2 for merge-2 mode). Flood-fill 4-neighbor same tier.
- Result tier: group 3–4 → +1, group ≥5 → +2. New pearl spawns at placed cell.
- Chain: after merge re-check at new cell; each chain +1 combo, 0.12s delay. Combo resets after 3s idle.
- 4-group bonus: +1 Shell × combo.
- Tier 10 merge → hatch (dolphin) or reward chest.
- Board full & no merge → offer: unlock corner (Stars) / clear low tiers / add chest.
- Hint after 5s idle highlights valid placement.
- Shells = `base[tier] * combo_mult` where combo_mult = 1 + 0.1*combo.

### Hatch table
| Tier | Common | Unc | Rare | Epic | Leg |
|---|---|---|---|---|---|
| 7–8 | 80 | 18 | 2 | 0 | 0 |
| 9 | 0 | 60 | 30 | 9 | 1 |
| 10 | 0 | 0 | 55 | 35 | 10 |
Pass shift: Prince +5%, King +10% toward higher rarity.

## 5. Instant Merge [OBS]
Uncommon Wave `0..1000`, Rare Wave `0..10000`. When full, MERGE button gives guaranteed Uncommon/Rare dolphin merge.

## 6. Tide Wheel [OBS+DES]
- Cost per spin: ◎100 wheel tokens. Mega x10: 1/day for ⭐100.
- Prizes weights: Fish 40, Pearls 25, Wave points 15, Hearts 10, Uncommon dolphin 7, Rare 2.5, God shard 0.5.
- Sequence: press → anticipate 5° back → 3–5 rotations 3.5–4.5s ease_out_cubic → pointer tick → zoom winner → popup → fly to HUD.
- Server decides result BEFORE animation.

## 7. Collections [OBS]
- Collection has `slots[N]`, each requires specific skin + min level 5 + fully fed.
- "Feed and Add" consumes dolphin (or locks copy) → slot filled → ADDED tag.
- Rewards tiers by size (12: 50K fish ⭐250; 24: 125K ⭐500–1500; 33: 1M ⭐12.5K; 39: up to 13.5M).
- Limited prize pool: `prize_total`, `prize_claimed` (server). "N of M players received".
- Top Collectors leaderboard by completed collections.

## 8. Market [OBS+DES]
- Per-rarity FIFO queue. Hot market session 10 min, listing bid window 24s.
- Buy with Fish or Stars. Fee 5% to sink.
- Price rule: `+0.5%` per buy, `-0.4%` per sell, empty queue `+2%/60s`, clamp [0.5×, 3×] base.
- Dolphin Trader (VIP): smart sell/buy thresholds, push notifications.
- "Crazy Market": 1h event, volatility x2.

## 9. Gods [OBS+DES]
Sizes SMALL/MEDIUM/LARGE/GREAT scale bonus. Types: Love (hearts on first 5 breedings), Harvest (fish/day up to 69.5K–95.7K), Hype (31% chance multiply shells). God level bar, dolphin slots with rarity limits.

## 10. Tasks [OBS]
Daily reset 00:00 UTC. Challenges checklist: feed 70, merge pearls 70, complete 30 tasks, add 10 to collection, merge dolphins; milestone chests at 25/50/75/100. Achievements one-time. Hearts milestones (11000, 14000, 14500…). Social one-time 🐟500 each.

## 11. Reef Pass
| Tier | Daily Fish | Breed bonus | Auto-merge | Extras |
|---|---|---|---|---|
| Pearl Prince | 5000 | +5% | 1 level | skip ads, skins, turbo feed |
| Sea King | 10000 | +10% | 1–3 levels | + all |
| VIP Leviathan | 15000 | +12% | 1–3 | Dolphin Trader |
Price [DES]: Prince ⭐299/14d.

## 12. Pod
Join/create, power = sum(member DLP rate), members ≤50, bonuses: activity fish, auto-merge ability, faster breeding.

## 13. Anti-cheat rules
Server validates every spend/reward, rate limits (feed ≤ 10/s), timestamps server-side, idempotency keys on claims, no client-sent balances.
