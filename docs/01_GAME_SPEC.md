# 01 — GAME SPEC

## 1. Concept
Player dolphins ko feed karta hai, breed karta hai, breeding se pearls milte hain, pearls board pe merge hote hain, naye dolphins hatch hote hain. Dolphins collections me add hote hain, market me bikte hain, aur passive DLP token kamate hain.

**Genre:** Idle + Merge + Breeding + Collection + Market
**Session:** 2–5 min, 6–10 sessions/day
**Orientation:** Portrait only, base 720×1600
**Audience:** Telegram users 16–40, low/mid Android

## 2. Core pillars
1. Hamesha kuch ready hona chahiye (timer, claim, spin).
2. Collect-them-all (collections + DLP counter).
3. Merge = dopamine (chhota 60–90 sec game).
4. Social + market (pod, hot market, leaderboard).

## 3. Core loops
- **Short (30s):** tap feed → fish kharch → level progress → DLP rate up.
- **Mid (5–10 min):** breed → wait 6h/booster → pearls → merge board → hatch.
- **Long (days):** collections → rewards → more slots → more dolphins → more DLP → gods/pod/market.

## 4. Entities
| Entity | Description |
|---|---|
| Dolphin | Rarity, level 1–5, skin, slot, state, feed count, breed cooldown |
| Pearl | Tier 1–10, merge board item |
| Collection | Theme set of 12/24/30/33/39 dolphin skins with prize |
| Ocean God | Big NFT-style item with size, level, slots, bonus |
| Pod | Player group, power, members |
| Pass | Reef Pass (Pearl Prince / Sea King / VIP Leviathan) |

## 5. Currencies
| Name | Type | Icon (tumhara asset) |
|---|---|---|
| Fish | Soft | blue fish |
| Stars | Premium | gradient star |
| DLP | Meta token | blue eye-wing logo |
| Sea Hearts | Event | pink heart |
| Shells | Tournament | shell |
| Wheel tokens | Utility | coin ◎ |
| Wave points | Utility | wave icon (Uncommon Wave / Rare Wave) |

Conversion [DESIGN]: 1 Star ≈ 400 Fish.

## 6. Rarities
Common (white), Uncommon (green), Rare (blue), Epic (purple), Legendary (gold).

| Rarity | Feed cost | DLP/hr | Breed cooldown |
|---|---|---|---|
| Common | 75 | 1.0 | 6h |
| Uncommon | 150 | 2.5 | 6h |
| Rare | 300 | 6 | 8h |
| Epic | 750 | 15 | 10h |
| Legendary | 2000 | 40 | 12h |

## 7. Dolphin states
`active`, `breeding`, `locked_new`, `empty_slot`, `max_level`, `staked`, `listed` (market).

## 8. Naming map (Duck → Dolphin)
Duck→Dolphin, Egg→Pearl, Love Egg→Heart Pearl, Fortune Egg→Golden Pearl, Corn→Fish, Pack→Pod, Gods→Ocean Gods, Duels Wheel→Tide Wheel, Ducker Pass→Reef Pass, Duck Trader→Dolphin Trader, Zen→Wave.

## 9. Content scope
- **Launch:** 6 collections × 24 skins = 144 dolphin skins, 3 Gods, 10 pearl tiers, 5 rarity frames.
- **Post-launch:** monthly new collection (placeholder card "New collections coming soon").

## 10. Progression gates
- Slots 1–5 free, 6–8 earn (tasks/collection), 9–11 Stars (120, 240, 480…) [DESIGN].
- Breed unlocks at feed progress 5/5.
- Only Lv5 fully-fed dolphins can be added to collections ("Feed and Add").

## 11. Win/engagement hooks
Daily pass claim, daily task refresh, wheel tokens, hot market 24-sec bids, tournament weekly rank, limited prize pools ("991 of 1000 players received").

## 12. Out of scope v1
Real token withdraw, NFT mint on-chain, PvP duels (UI placeholder only), Pod boss.
