# 02 — UI SPEC

Base resolution **720×1600**, portrait. Godot stretch: `canvas_items`, aspect `expand`. Respect Telegram safe areas.

## 1. Design tokens
| Token | Hex | Use |
|---|---|---|
| bg_main | #0D0F17 | app bg |
| bg_card | #171A25 | cards |
| bg_card2 | #1E2230 | inner rows |
| stroke | #2A2F40 | borders |
| text_primary | #FFFFFF | titles/numbers |
| text_secondary | #9AA0B4 | helper |
| accent_gold | #FFC933 | primary CTA |
| accent_orange | #FF9F1C | progress, active |
| accent_cyan | #00D4FF | DLP glow (brand) |
| fish_green | #6BE35A | Fish |
| star_blue | #5B7CFF | Stars |
| heart_pink | #FF4D8D | Hearts/combo |
| danger | #FF3B3B | badges |
| rarity_common | #D8DCE8 | |
| rarity_uncommon | #3DDC68 | |
| rarity_rare | #3B82FF | |
| rarity_epic | #A855F7 | |
| rarity_legendary | #FFC933 | |

## 2. Typography
- Titles/numbers: condensed bold caps (Bebas Neue / Barlow Condensed Bold / Oswald Bold).
- Body: Inter 22–24px.
- Sizes: DLP counter 64, screen title 40, card title 28, button 28, tag 18.
- On-art text: 2px black outline.

## 3. Spacing
8px grid. Screen padding 24, card gap 16, section gap 32. Card radius 28, button radius 44.

## 4. Global shell
### Top bar (h=72, y after Telegram header)
`[Avatar+username] [POD pill] [Wallet btn] ........ [Fish count] [Stars count]`
Market tab me 3rd currency pill bhi dikhta hai.

### Bottom nav (h=96)
`MARKET | PEARLS | DOLPHINS | GODS | TASKS`
- Active: icon+label bright (gold on Dolphins). Inactive grey.
- PEARLS badge = queued pearl count (red circle). TASKS red dot when claimable.

## 5. Screens

### 5.1 DOLPHINS (home)
Order top→bottom:
1. DLP counter (logo + `183.49`, cyan glow, count-up tick).
2. Left chips: Reef Pass (crown, +1), Daily Pass (gem, +1). Right chips: Energy `64.9K/2000` (lightning), Streak `5 DAYS +2`.
3. **Dolphin Card** 540×760: rarity frame + glow, `LVL n` pill top-left, rarity text top-center, status icon top-right, dolphin art center, white tilted tag bottom "TAP TO FEED 🐟150" + "RESET IN 6:48:45".
4. Slot dots row (11): green=owned, white=selected, grey=empty, lock, `+`.
5. Breed bar: level circle, orange progress, `BREED 5/5` pill, `STAKE` pill, crown, (i).
6. Scroll below: Duel/Dive Bonus ladder, Energy, Tide Wheel entry, Collections, Top Collectors.

States: Active, Breeding (dim + glass + "BREEDING IN PROGRESS / DO NOT DISTURB" + pink heart-dot timer), Locked/New ("Get a slot ⭐120"), Empty, Max level (gold crown frame).

### 5.2 PEARLS (merge)
- Top stage banner (reef stage, lights), avatar dolphin + combo badge `X13` + shells `♪65`, trophy button left (`50`), chest right.
- 7×7 glass tray; 4 corner cells locked; outer ring dimmer, center brighter.
- "NEXT PEARL — IN QUEUE AND N MORE" row with 2–6 pearls; first one highlighted white border.
- Free chest cell with timer `00:07:04`.

### 5.3 MARKET
Title `DOLPHINS | GODS`, rarity tabs `UNCOMMON RARE EPIC LEGENDARY MY MARKET`. Hot card: art, LVL, income, seller, countdown, refresh, two buy buttons (Fish / Stars). "Hot market ends in mm:ss" banner, price chart. Price popup with `10S 5M 1H 1D`. My Market: My Dolphins, Dolphin Trader (Smart Sell/Buy/Push).

### 5.4 GODS
Medallion row (3), big god card with chips (type, NFT, ID, LVL range, size), size tabs SMALL/MEDIUM/LARGE/GREAT, stat blocks, god level bar, slot chips, CTA `UNLOCK` (v1) / `MINT` (later).

### 5.5 TASKS
Top toggle `TASKS | FRIENDS`; scroll tabs: Kit, Honor Rewards, Tournament, Ads, Partners, Challenges, Achievements, Friends, Hearts, Social, Fortune, Group. Task row: icon chip, caps title, thin yellow progress, button `OPEN` / `CLAIM REWARD` / ✔.

### 5.6 Popups
Reef Pass (3 tier cards), Not-enough-Stars (packs 75/500/1000/5000/10000), Breeding (two dolphins, fee, boosters 6/12/24h ×2 rows), Rewards Unlocked (free vs PREMIUM), Collection detail, Tide Wheel, Pod, Wallet.

## 6. Components
| Component | Spec |
|---|---|
| Primary btn | gold, h88, r44, black caps text, 6px darker bottom shadow; pressed: y+4 |
| Secondary btn | #2A2F40, white text |
| Disabled | #3A3F52, 50% text |
| Chip | dark glass, r40, icon+text |
| Card | r28, 1px stroke, top-light gradient |
| Progress | h28, bg #0A0C12, orange→yellow fill, round cap |
| Badge | red 36px circle |
| Toggle | green/grey (ANIMATIONS toggle) |
| Segmented tabs | active white/black, inactive dark |
| Toast | white pill top, black text, 2.5s |
| Modal | bottom sheet, dim 60%, ✕ top-right |

## 7. UI animation table
| Element | Anim | Time | Ease |
|---|---|---|---|
| Tab change | fade+slide Y24 | 0.22 | out_cubic |
| Sheet open | slide from +600 | 0.30 | out_back |
| Button press | scale .94 | .08/.12 | out |
| CTA idle | scale 1↔1.04 | 1.2 loop | sine |
| Count-up | digit roll | 0.5 | out_quad |
| Badge pop | 0→1.2→1 | 0.3 | back |
| Card swipe | follow+snap | 0.28 | out_cubic |
| Dolphin idle | float ±6px | 2.4 loop | sine |
| Tap feed | squash 1.08/.92 | .25 | elastic |
| Float text | rise 80px+fade | 0.7 | out |
| Locked shake | x±8 ×3 | 0.3 | – |
| List stagger | +40ms each | – | out_cubic |

Rules: UI anim 0.15–0.35s, reward anim 0.6–1.2s, never block >1.5s (tap to skip).

## 8. VFX list
Bubbles ambient (12), light rays (3), confetti (30), sparkle (8–20), ring wave, splash (14), heart burst (12), fish shower (20), rarity glow shader, legendary aura, shine sweep shader, caustics overlay, screen flash, screen shake.
Budget: ≤120 live particles/screen; `ANIMATIONS` toggle halves particles.

## 9. Audio
Feed bloop, merge bell (+1 semitone per chain), combo swell, hatch crack+chirp, wheel tick/fanfare, UI bubble pop, level-up harp, error thud, ambient underwater loop.

## 10. Accessibility/perf
Min touch target 88px. Contrast ≥ 4.5:1 on body text. 60fps target, 30fps battery mode.
