# 🐬 DOLPHIN PEARL — Complete Game Design Document (GDD)

**Working title:** Dolphin Pearl (naam baad me badal sakte ho)
**Reference game:** Duck My Duck (Telegram mini-app) — jo video tumne bheja, usi ke screens se ye document banaya hai
**Theme swap:** Duck → Dolphin | Egg → Pearl | Corn → Fish | Pond/Music stage → Ocean reef
**Engine:** Godot 4.x (HTML5 export → Telegram Mini App) | Portrait 720×1600 base (video bhi 720×1594 hai)

> **Padhne se pehle ek zaroori baat:** Video me jo cheezein *saaf dikhi* wo "OBSERVED" hain. Jahan video me mechanic poori dikhi nahi (jaise merge board ke exact rules, exact formulas), wahan maine "DESIGN" likha hai — wo mera proposed balanced version hai. Tum apne game ke hisaab se numbers tune kar sakte ho. Poora game bilkul same chahiye to OBSERVED wale part ko 1:1 follow karo.

---

## 0. Quick Mapping Table (Duck → Dolphin)

| Original (Duck My Duck) | Tumhara game (Dolphin Pearl) | Asset |
|---|---|---|
| Duck (Ducker) | **Dolphin** | tumhare 2 dolphin art (happy = normal, smug = breeding/cooldown) |
| Egg (merge board) | **Pearl** | naya banana hai (asset list section 28) |
| Love Egg | **Heart Pearl** | pink-red pearl |
| Fortune Egg | **Golden Pearl** | gold pearl |
| Corn (green, soft currency) | **Fish** | tumhari blue fish |
| Stars (blue star, premium) | **Stars** | tumhara gradient star |
| DMD token (orange "D" logo, 183.25) | **DLP token** (Dolphin Points) | tumhara blue eye/wing logo |
| Music notes (tournament currency) | **Shells** | naya |
| Zen points (instant merge) | **Wave points** | naya |
| Hearts (love eggs se milte) | **Sea Hearts** | naya |
| Pack | **Pod** (dolphins ka group — perfect naam) | logo + icons |
| Gods (NFT) | **Ocean Gods** (Poseidon, Kraken, Mermaid Queen, etc.) | naya |
| Duels Wheel | **Tide Wheel** | naya |
| Collections (Music Award, Egyptian Feast…) | **Reef Collections** (Pirate Cove, Coral Carnival, Arctic Night…) | naya |
| Ducker Pass (Prince/King/VIP) | **Reef Pass** (Pearl Prince / Sea King / VIP Leviathan) | naya |
| Daily Pass | **Daily Tide Pass** | naya |
| Boosters (6h/12h/24h pills) | **Sea Boosters** (6h/12h/24h) | naya |
| Duck Trader (smart sell/buy) | **Dolphin Trader** | UI only |
| Hot Market | **Hot Reef Market** | UI only |

---

## 1. Game Overview

### 1.1 One-line pitch
"Apne dolphins ko feed karo, pearls merge karo, naye dolphins paida karo, collections complete karo aur DLP token kamao."

### 1.2 Genre
Idle / Tap-to-feed + Merge + Breeding + Collection + Market economy (Telegram Mini App style, F2P, session 2–5 min, 6–10 sessions/day).

### 1.3 Core pillars
1. **Hamesha kuch ready hota hai** — feed timer, breeding timer, tournament timer, task claim, wheel spin. Player ko har baar app kholne ka reason mile.
2. **Collect-em-all** — 2 numbers ka dopamine: DLP counter (upar bada number) + collection progress bars.
3. **Merge = dopamine** — pearl board chhota session-game hai: 60–90 sec, confetti, combo.
4. **Social/Pod + Market** — dusre players se interaction (hot market bid, pod bonus, leaderboard).

### 1.4 Target audience
Telegram users, 16–40, casual crypto/airdrop-curious, mobile low-mid end phones (isliye lightweight FX).

---

## 2. Core Loop

```
        ┌────────────────────────────────────────────────────────┐
        │                                                        │
   [FEED dolphin]──►[Dolphin Level 1→5]──►[BREED 5/5 ready]──►[Breeding 6h timer]
        ▲                    │                                   │
        │                    ▼                                   ▼
   Fish (soft cur)      DLP token tick up                  [PEARLS milte hain]
        ▲                (mining/passive)                        │
        │                                                        ▼
   [Sell dolphin/market]◄──[New Dolphin born]◄──[PEARL BOARD: merge pearls]──►Hatch
        │                         │                              │
        ▼                         ▼                              ▼
   Stars / Fish           [Collection slot fill]          Hearts / Shells / Combo
                                  │
                                  ▼
                       Collection reward (Fish+Stars+Power)
```

### Short loop (30 sec)
Tap to feed → fish kharch → DLP/second badhta hai → level bar fill.

### Mid loop (5–10 min)
Dolphin breed karo → wait 6h (ya booster) → pearls aate hain → pearl board me merge → naya dolphin hatch.

### Long loop (days–weeks)
Collection complete → Power + Stars + Fish → zyada slots → zyada dolphins → zyada DLP → Gods/Pod/Market.

---

## 3. App Structure & Navigation (OBSERVED)

### 3.1 Global shell (har screen pe same)

**Top Safe Area (system):** Telegram "✕ Close" left, ⌄ and ⋮ right (ye Telegram ka hai, hum nahi banate).

**Top Bar (hamara, ~72px height):**
- Left: Avatar circle (player ka Telegram photo) + username chhota (neeche)
- "POD" pill button (icon + text) → Pod screen
- Wallet icon button (square pill) → Wallet screen
- Right: `Fish count` 🐟 | `Stars count` ⭐ (number white bold, condensed font)
  - Market ke andar 3rd currency bhi dikhti hai (`0 🟠`) = TON/Gram jaisa hard currency → hum optional "Gem" rakh sakte hain

**Bottom Nav (5 tabs, ~96px):**
`MARKET | PEARLS (Eggs) | DOLPHINS (Ducks) | GODS | TASKS`
- Active tab: icon + label **orange/gold** (DOLPHINS) ya white (baaki), inactive: grey
- Badge: red circle number (jaise EGGS 16/22/17) = kitne pearls queue me hain
- TASKS pe red dot jab claim ready ho

> Note: video me alag screens par active tab ka color alag dikha (Ducks = orange highlight jab Ducks section me, white jab dusre tab me). Hum: **active = white, section brand color = gold**, simple rakho.

### 3.2 Screen Map

```
Dolphins (HOME)
 ├─ Dolphin Card (main)
 ├─ Slots row (11 dots)
 ├─ Breeding bar
 ├─ Sub-pages (scroll niche): Duel Bonus, Energy, Tide Wheel, Collections, Top Collectors
 ├─ Reef Pass popup (Prince / King / VIP)
 ├─ Not-enough-stars popup (star pack buy)
 └─ Breeding popup (other dolphin, boosters)
Pearls  (merge board, 7×7)
Market  (Hot market bids, Price chart, My Market, Dolphin Trader)
Gods    (Ocean Gods cards, mint NFT optional)
Tasks   (Tasks / Friends) → Tabs: Kit, Honor Rewards, Tournament, Ads, Partners, Challenges, Achievements, Friends, Hearts, Social, Fortune, Group
Pod     (recommended pod, what the pod gives)
Wallet  (Gram / Dolphins / Gods tabs)
```

---

## 4. HOME — Dolphins Screen (sabse important)

### 4.1 Layout (top → bottom), 720 wide base

1. **DLP Counter row (center, y≈150):** logo (tumhara blue eye logo) + bada number `183.49` (white, ~64px, condensed bold). Ye har second thoda badhta hai (2 decimal).
   - Number badhne par har tick pe chhota "count-up" animation (digits roll).
2. **Left vertical chips (x≈20):**
   - 👑 **Reef Pass** card (gold crown, label "REEF PASS", `+1`)
   - 🔴 **Daily Tide Pass** (red-pink gem icon, label "DAILY PASS", `+1`)
3. **Right vertical chips:**
   - ⚡ **Energy**: `64.9K / 2,000` (bar-less pill with lightning icon)
   - 🗓 `5 DAYS` streak chip, `+2`
4. **Dolphin Card (center, 540×760):**
   - Frame color = rarity (Common white-grey, Uncommon green glow, Rare blue, Epic purple, Legendary gold)
   - Top-left: `LVL 5` pill; top-center rarity text `UNCOMMON`; top-right small circular icon (dolphin status: heart/lock)
   - Dolphin art center (tumhara dolphin; **happy** = idle, **smug** = high level/cooldown)
   - Bottom label (white tag, black text, rotated -3°): **"TAP TO FEED 🐟150"** + chhota "RESET IN 6:48:45"
   - Floating `+150` text jab tap karo
   - Background: rarity-colored radial glow + faint repeated silhouettes (doosre dolphins ka ghost pattern) side me
5. **Slots row (y≈1010):** 11 circular dots — green filled = unlocked dolphin, white = selected, grey = empty, 🔒 = locked, `+` = new slot
   - Left ke 2 icons: pill-icon (booster) aur pointer
6. **Progress/Breeding Bar (y≈1090):** orange bar jisme left circle (level 3), egg/pearl marker, right `BREED 5/5` pill + `STAKE` pill, crown icon upar.
7. **Info (i)** button right side.

### 4.2 Interactions
| Action | Result |
|---|---|
| Tap on card | Feed (fish deduct, DLP rate boost chhota, level bar +) |
| Swipe left/right on card | Next/previous dolphin (slot) — card slide + parallax |
| Tap slot dot | Direct jump to that dolphin |
| Tap locked slot | "Get a new slot 🌟120" popup |
| Tap Breed 5/5 | Breeding popup (partner dolphin choose) |
| Tap Stake | Dolphin ko stake (DLP multiplier, lock time) |
| Tap Reef Pass chip | Pass popup (3 tiers) |
| Tap Energy chip | Energy details page |

### 4.3 States of Dolphin Card (OBSERVED)
1. **Active / Feedable** — normal card, glow green/white.
2. **Breeding in Progress** — card dim, glass overlay, white tag "BREEDING IN PROGRESS / DO NOT DISTURB", countdown `05:45:52` neeche bar me, pink heart-dots progress.
3. **Locked / New** — lock icon big, "THIS IS A NEW DUCK / Get a slot for it" → hamare liye "NEW DOLPHIN — Get a slot 🌟120".
4. **Empty slot** — transparent frame, "Add dolphin".
5. **Max level** — gold frame + crown.

---

## 5. Dolphin System

### 5.1 Rarities (OBSERVED: Common, Uncommon, Rare, Epic, Legendary)

| Rarity | Color | Feed cost base (Fish) | DLP/hr base | Max Lvl | Breed cooldown |
|---|---|---|---|---|---|
| Common | White/Grey | 75 | 1.0 | 5 | 6h |
| Uncommon | Green | 150 | 2.5 | 5 | 6h |
| Rare | Blue | 300 | 6 | 5 | 8h |
| Epic | Purple | 750 | 15 | 5 | 10h |
| Legendary | Gold | 2,000 | 40 | 5 | 12h |

(DESIGN — video me "Tap to feed 75/80/150" dikha, baaki scale mera hai.)

### 5.2 Level & Feed
- Level 1→5. Har level ke liye **N feeds** (Lv1: 5 feeds, Lv2: 8, Lv3: 12, Lv4: 18, Lv5: 25).
- Feed ke baad **"RESET IN 6:48:45"** — daily-like cooldown: ek dolphin ko ek window me limited feeds. Reset ke baad phir feed.
- **Fully fed Lv5** dolphin hi collections me **"Feed and Add"** ke liye valid hai (video: "Fully fed level 5 ducks required").
- **Breed 5/5**: matlab 5 successful feeds (progress 0/5 → 5/5) ke baad breed unlock.

### 5.3 Dolphin Variants (skins)
Collections me har dolphin ek **skin/costume** hota hai: Pirate, Pharaoh, Samurai, Astronaut, DJ, Chef, Viking, Wizard…
- Base art = tumhara dolphin; skins = same dolphin + accessory overlay (hat, glasses, weapon).
- **Production tip:** accessories ko alag PNG layers rakho (hat/eyes/body-armor/handheld). Godot me `Sprite2D` stack. Isse 500+ variants bina 500 full-art ke ban jayenge.

### 5.4 Moods (tumhare 2 dolphin art ka use)
| Mood | Art | Kab dikhe |
|---|---|---|
| Happy | dolphin #1 (smiling) | feed hone ke baad, idle, new born |
| Smug/Bored | dolphin #2 (half-lid eyes) | feed cooldown, breeding "do not disturb", max level showoff |
- Transition: 0.25s crossfade + chhota squash/stretch.

### 5.5 Slots
- 11 slots dikhe (video me 8 green + locks + plus).
- Slot 1–5 free, 6–8 earn, 9–11 star se (🌟120, 240, 480…) (DESIGN).
- Slot unlock ke baad "new dolphin" dalne ke liye dolphin chahiye (hatch/market se).

### 5.6 Breeding (OBSERVED)
Flow:
1. Breed 5/5 dabao → **Breeding popup** open:
   - "DOLPHIN IS BREEDING" title
   - Left: tumhara dolphin, right: **partner dolphin** (other player ka — "OTHER DUCK RARITY: COMMON / OWNER: PLAYER6407912 / FEE PAID 🐟100")
   - Partner **matchmaking**: system ya market se random partner; fee Fish me.
2. Breeding timer: **06:00:00** (video: 05:45:52…). Dolphin card "Breeding in progress".
3. Boosters (pills): **6h / 12h / 24h** (instant finish ya time-cut) — star se buy ya task reward.
   - Do types: simple pill (time kam) aur ⏳ hourglass pill (**auto-breed again**) (video me 2 rows, 3-3 icons).
4. Complete → **Pearls** milte hain (normal Pearl + kabhi **Heart Pearl** 5% chance).
5. Parent dolphin ka feed counter reset.

**Breeding partner rewards:** Partner owner ko bhi fee milta hai (fish) → player-to-player economy.

### 5.7 Staking
- "STAKE" button: dolphin ko lock kar do X din → DLP multiplier +10–50%.
- Staked dolphin market me sell nahi ho sakta.

---

## 6. Pearl Board (Merge System) — "Eggs" tab

### 6.1 Observed layout
- Upar **Stage banner** (purple music stage with spotlights) — hamare liye **Underwater Reef Stage** (bioluminescent lights, bubbles).
  - Isme tumhara avatar-dolphin chhota (headband, DJ-like) + `X13` combo badge (pink starburst) + `♪ 65` shells counter.
  - Left: 🏆 Tournament trophy (`50`) button
  - Right (dolphin ke pass): chhota ⚙ speaker box = reward chest
- Neeche **7×7 grid** (~49 cells), rounded glass tray, dark.
  - **Corners (4)** = locked 🔒 (grey pearls) — unlock star se ya tournament se
  - Outer ring dim/blurred pearls (low tier), center bright (high tier) — visual depth.
- **"NEXT PEARL — IN QUEUE AND 1 MORE"** row: 2–6 pearls queue (white-cream default pearl).
- Timer chest (`00:07:04`) cell me: free chest cooldown.

### 6.2 Pearl Tiers (DESIGN — 10 tiers)

| Tier | Name | Color | Shape |
|---|---|---|---|
| 1 | Plain Pearl | cream/white | round, soft glow |
| 2 | Shell Pearl | pearl-white + pink | sheen |
| 3 | Sea Glass | teal | crystal edges |
| 4 | Blue Pearl | blue | glossy |
| 5 | Violet Pearl | purple | sparkles |
| 6 | Coral Pearl | orange-red | coral texture |
| 7 | Heart Pearl | pink-red heart gem | heart inside |
| 8 | Golden Pearl | gold shell cup | golden ring |
| 9 | Royal Pearl | gold+purple gem | crown |
| 10 | Leviathan Pearl | rainbow/glow | animated aura |

(Video me heart/golden/violet/blue-gem eggs dikhe — wahi style.)

### 6.3 Merge Rules
Video se confirm nahi ki exact rule (match-3 ya merge-2). **Mera recommended (Match-3 merge, jaisa video ke cluster of 3 hearts me dikha):**
1. Queue ka **next pearl** kisi bhi **empty/unlocked cell** pe tap karke place karo.
2. **3 ya zyada same tier** adjacent (4-direction) → merge → **1 pearl of next tier** (jahan place kiya wahan banta hai).
3. 4 same → next tier + **bonus Shell**; 5+ same → **skip tier** (2 tier upar).
4. **Chain reaction**: naya pearl agar adjacent same se mil jaye to auto-chain merge. Har chain +1 **combo** (X13 jaisa).
5. Combo timer: 3 sec ke andar agla merge → combo bana rahe.
6. Board full + koi merge nahi → **Board Clear** (low tiers swept) ya "Add slot ⭐" option.
7. Max tier (10) merge → **Hatch**: pearl dolphin me badal jata hai (Dolphin Egg → Dolphin) ya ek **Reward Chest**.

> Alternative (agar simple chahiye): **Merge-2** (do same tier → next tier). Ye idle-casual ke liye easy hai. Dono ko config flag se switch kar sakte ho: `merge_min_count = 3 | 2`.

### 6.4 Pearl Queue & Energy
- Queue me pearls breeding se aate hain. **EGGS badge number** = queue count (16, 22, 17...).
- Queue khali = board play nahi hoga → breeding karo / tasks / ads / stars se pearls kharido.
- **Pearl Drop sources:** breeding (main), tasks, chest, tournament reward, Instant Merge (Wave points), ads.

### 6.5 Scoring → Shells & Tournament
- Har merge = Shells (♪ jaisa). Formula: `shells = base(tier) × combo_multiplier`.
- **Tournament:** 24h/7d window, shells se rank. Trophy `50` = tumhari rank/entry.
- "Music Tournament: complete the whole collection → up to 20,000,000 fish" → hamare liye **"Reef Tournament"**.

### 6.6 Instant Merge (OBSERVED, Tasks→Group)
- **Uncommon Wave** `473/1000` aur **Rare Wave** `1040/10000`: points full hone par guaranteed Uncommon/Rare dolphin merge button active.
- Source: wheel spins, tasks.

---

## 7. Tide Wheel (Duels Wheel) — OBSERVED

Screens: "DUELS WHEEL — Earn wheel tokens in duels and get one step closer to owning a Ducky God — an NFT traded on GetGems", Spin the wheel button.

### 7.1 Layout
- Half-wheel (bottom up), 8–10 segments, top pe pointer (triangle).
- Segments me prizes: Pearl-gem (100), Fish pile (15000, 2500), Heart pearl (25), Dolphin silhouette (UNCOMMON DOLPHIN), Rare-zen type (100 "RAREZEN" jaisa → "WAVE").
- Center bada **yellow SPIN button** (`SPIN ◎100` — tokens cost).
- Neeche: `WHEEL ◎100` (normal) | `1 PER DAY MEGA X10 ⭐100` (mega spin).
- Bottom bars: `473/1000` green (Uncommon Wave) + `940/10000` purple (Rare Wave) + "TASKS >" link.
- Top-left token balance (`◎ 250` → spin ke baad 150 → 50).

### 7.2 Spin sequence (animation)
1. Press → button squash 0.9 (80ms).
2. Wheel anticipation: 5° back (200ms).
3. Spin: 3–5 rotations, `ease_out_cubic`, 3.5–4.5 sec; segments blur karo last me nahi (performance).
4. Tick sound har segment par + pointer flick (±12° bounce).
5. Stop → winning segment zoom (scale 1.25) + glow ring + rays.
6. Prize popup: "100 RARE WAVE" card slide up center (scale 0.5→1 back-out 300ms), particles.
7. Prize fly to HUD counter (curve path 0.6s).

### 7.3 Tides (probabilities) DESIGN
Fish bundle 40%, Pearls 25%, Wave points 15%, Hearts 10%, Dolphin (Uncommon) 7%, Rare 2.5%, Jackpot (Ocean God shard) 0.5%.

---

## 8. Collections System (Biggest content engine) — OBSERVED

### 8.1 Concept
Har collection = ek theme set (jaise "Egyptian Feast", "Olympic Celebration", "Aztec Carnival", "Football Tournament", "Jolly Roger"…) jisme **N dolphin skins** hote hain (24/30/33/39).
Player jo dolphin Lv5 fully-fed karta hai use **"Feed and Add"** karke collection me daal deta hai (dolphin consume hota hai/ya copy lock). Collection complete → **prize**.

### 8.2 Page structure
- **Top Collectors** (leaderboard, spinner loading) aur **All Collections** list.
- **Collection card** (grid 3 col): icon, name, mini duck-silhouette grid (filled green = collected, dark = missing), reward line `🐟 125.0K ⭐ 500 + CHANCE 🔵 50`.
- Tap → **Collection detail:** header "COMMON POWER", "EIGHTH PRIZE — Already 991 of 1000 players have received", reward `50000 fish ⭐250 +Chance ◆25`, progress `3 of 12 collected | 0 available`, grid of dolphins (name tag Common/Uncommon (5+ LVL)/Rare, income `+15000` ya `⭐+50`), **ADDED** tag (green border) jab ho gaya.
- "Feed and Add" tag: jo dolphin add ho sakta hai, gold border.

### 8.3 Collection list (inspiration, hamare theme ke naam)
| Original | Dolphin Pearl version |
|---|---|
| Common/Uncommon/Rare Power | Common/Uncommon/Rare **Current** |
| Big Knowledge Day | **Pearl Scholar Day** |
| Four Challenges | **Four Trials of the Deep** |
| Sea Journey | **Voyage of the Tides** |
| Fellowship of the Pack | **Fellowship of the Pod** |
| Common Hipster | **Hipster Reef** |
| Prince Ducker | **Pearl Prince** |
| Country Cruise | **Coastal Cruise** |
| Spring Picnic | **Spring Bloom** |
| Twelve Friends | **Twelve Seahorses** |
| Women's Day | **Mermaid Day** |
| Epic Telegram Gifts | **Epic Telegram Gifts** (same) |
| Jolly Roger | **Captain Fin** |
| Red King | **Crimson Kraken** |
| Winter Magic | **Frozen Fjord** |
| Players Choice | **Players Choice** |
| Football Tournament | **Water-Polo Cup** |
| Rock Festival / Halloween Night / Love Ducks | **Reef Rock / Spooky Lagoon / Love Dolphins** |
| Olympic Party/Feast/Celebration | **Atlantis Games** x3 |
| Aztec Mini Party/Party/Feast/Celebration/Festival/Carnival | **Maya Reef** series |
| Egyptian Feast | **Nile Delta Feast** |
| Small/Medium/Big Parade, Rare/Epic Carnival | **Parade of Waves** series |
| Common/Uncommon/Rare Athletes | **Swim Athletes** |
| Music Award | **Reef Music Award** |

### 8.4 Reward scale (DESIGN, observed numbers ke aas-paas)
| Collection size | Fish | Stars | Chance (wheel/token) |
|---|---|---|---|
| 12 | 50K | 250 | 25 |
| 24 | 125K | 500–1500 | 25–50 |
| 33 | 1M | 12,500 | 50 |
| 39 | 1.75M–13.5M | 6,000–10,000 | 50–100 |
| Mega (Music Award) | 20M | — | — |
Prize numbers "Eighth/Fifth/First Prize — already X of Y players received": **limited prize pool** (first 1000/200/N players) → scarcity + urgency. Tum bhi rakho: `prize_pool_total`, `prize_pool_claimed` server side.

---

## 9. Market (OBSERVED)

### 9.1 Structure
Top segmented title: **DOLPHINS | GODS** (big, white=active, grey=inactive), neeche rarity tabs: `UNCOMMON | RARE | EPIC | LEGENDARY | MY MARKET`.

### 9.2 Hot Market card
- Dolphin art (green/rarity bg), `LVL 5`, income `◎ 40.8`, seller id (`BATARO_MONTRACK…`)
- Countdown `03 / 24 sec` (bid window) + refresh button 🔄
- Do buy buttons: **🐟 432.7K** (Fish me) aur **⭐ 459** (Stars me)
- After buy: "SOLD TO ANOTHER COLLECTOR ⭐400" panel.
- Niche: "Hot market ends in 09:15" banner (market session timer) aur **price chart** (green line spikes).

### 9.3 Price/Chart popup
- Title "UNCOMMON DOLPHINS PRICES", range chips `10S 5M 1H 1D`, line chart, labels: `160.9K +7%` (fish), `400 +33%` (star).
- "SELL YOUR DOLPHIN": same quality dolphins ek queue me bikte hain — **FIFO (First In First Out)**.
- "PILOT VERSION: Pricing rules may be adjusted. Prices increase when a dolphin is purchased or there are no dolphins in the queue."

### 9.4 Dynamic price formula (DESIGN)
```
price_next = price_now × (1 + k_buy)     # har buy pe +0.5% (k_buy=0.005)
price_next = price_now × (1 - k_sell)    # har sell pe -0.4%
if queue_empty: price_next *= 1.02 every 60s
price clamp: [base × 0.5, base × 3]
```
- Fish price aur Star price alag chalte hain; star price = fish price / star_to_fish_rate (≈ 380–420).

### 9.5 My Market
- "MY DOLPHINS — dolphins you've listed"
- **DOLPHIN TRADER** (Reef Pass VIP only):
  - **Smart Sell:** price X pe auto-sell (pause jab price reach ho).
  - **Smart Buy:** market me price ≤ X pe auto-buy.
  - **Push Notifications.**
  - Sub-tabs `SELL | BUY | PUSH`, rarity chips, "if the price in [Fish | Stars] drops to [number]" stepper (− / +), button **BUY REEF PASS**.

### 9.6 Market Events: "Crazy Market" (achievement me "Activate the crazy market 🌟1200") = 1h ka event jisme price volatility high.

---

## 10. Ocean Gods (Gods tab) — OBSERVED

- Title `DUCKS | GODS`. Upar 3 round medallion icons (Love God, Hype God, Harvest God …) — categories.
- **God Card (big):** badge chips `LOVE GOD`, `NFT`, `ID 1`, `LVL 12–120`, `GREAT`. Art = bada illustrated character on cloud / lotus (cartoonish, pixel + gold, heavy detail).
- Hamare gods: **Poseidon, Kraken Lord, Mermaid Queen, Coral Witch, Leviathan, Pearl Sage, Storm Titan** (Love/Hype/Harvest types).
- Size tabs: `SMALL | MEDIUM | LARGE | GREAT` → god ka size = benefit scaling.
- Stats:
  - "FIRST 5 DUCK BREEDINGS YIELD UP TO: ❤ 8,112 / 10,336" (Hearts)
  - "CAN BRING PER DAY UP TO 🐟 69,500 / 95,750" (Harvest God)
  - "CHANCE TO MULTIPLY SHOW FANS UP TO 31%" (Hype God → hamare liye **"Chance to multiply Shells 31%"**)
  - **GOD LEVEL (bonus power)** bar `6/87` → `0/129`
  - **DUCK SLOTS:** `X5 UNCOMMON OR LOWER` | `RARE OR LOWER` | `UNIQUE` | `X7 RARE OR LOWER` | `EPIC OR LOWER` — yaani god ke andar kuch dolphins ko "assign" karo (slots) → bonus power.
- CTA: **MINT NFT FOR 🔶1000** (optional on-chain; free-to-play ke liye "UNLOCK" button rakho).
- "Queue is empty 25%…" = god ke liye dolphin queue (assigned dolphins list).
- NFT note: Telegram/TON integration baad me, v1 me sirf in-game item rakho (legal risk kam).

---

## 11. Tasks Hub (OBSERVED) — retention ka dil

Top toggle: **TASKS | FRIENDS**. Neeche scrollable tab strip: `Kit, Honor Rewards, Tournament, Ads, Partners, Challenges, Achievements, Friends, Hearts, Social, Fortune, Group`.

| Tab | Content | Reward |
|---|---|---|
| **Tasks (main)** | "TAKE THE NEW CHALLENGE — Complete tasks daily, earn tokens to spin and upgrade the wheel." Refresh timer `01:31:20`. Rows: Complete 45 orders, Take part in 7 duels, 10 duels, Use 100 stars | Wheel tokens ⚡ |
| **Kit** | starter kit | Fish/pearls |
| **Honor Rewards** | "Honor letters" (Show/Sabotage letters) trade karke King of the Hill se legendary cards | cards |
| **Tournament** | Add 1/3 dolphins to collection (OPEN), **Music Tournament** → 20M fish for completing whole collection | fish |
| **Ads** | "WATCH AND EARN" — har ad par fish/keys/pearls; Reef Pass owner ads skip | fish 100, key, egg |
| **Partners** | partner app tasks | stars |
| **Challenges** | Checklist (✔): Feed a dolphin 70 times, Merge pearls 70 times, Complete 30 tasks, Add 10 dolphins to collection, Merge dolphins 1 time; milestone rewards 25/50/75/100 (`Collected: 100` + key icon) | feather icons ×20 each |
| **Achievements** | Merge 100 pearls (9), Set Prince Dolphin for a week, Open ten Love pearls (12), Successfully merge dolphins ⭐40/⭐100, Send 5 dolphins to stake ⭐300, Activate crazy market ⭐1200 | stars/fish |
| **Friends** | Invite link, referral bonus | stars + fish |
| **Hearts** | "COLLECT HEARTS — Collect love pearls during breeding to get hearts and complete tasks. You have 81105 ❤" milestones 11000, 14000, 14500, 17500… → rewards: Fish pot, new slot, fortune pearl, ⭐50 | scaling |
| **Social** | Join Telegram channel/chat (🐟500), VK, X, Discord (🐟500) | one-time |
| **Fortune** | Fortune (golden) pearl spin/draw | random |
| **Group** | Pod-related, "BUY A DOLPHIN ON THE MARKET → +⭐21000 star bonus", **INSTANT MERGE** (Wave points) | — |

**Task UI row:** left icon chip (orange lightning on dark circle with number), title white bold caps, progress bar yellow (thin), right button `OPEN` (dark pill) ya `CLAIM REWARD` (yellow pill) ya ✔ (green check).

---

## 12. Pod (Pack) — Social

- **RECOMMENDED FOR YOU:** pod card (name, "2409 power · 18 members · You match by DLP"), yellow **JOIN THE POD**, link "CHOOSE ANOTHER OR CREATE POD".
- **WHAT THE POD GIVES:** 3 cards (icon+text):
  1. Pod activity → fish + rewards
  2. Pod abilities → **auto-merge** aur faster dolphin breeding
  3. Pod boss/event (future)
- Pod level, member cap 50, pod chat link (Telegram group), weekly pod goal.

## 13. Wallet — OBSERVED
Tabs `GRAM | DOLPHINS | GODS`. DLP balance bada (`0`), text: "The DLP token that you took out of your dolphins. You currently have 11 dolphins containing 183.49 tokens." Wallet connect dropdown (TON address `UQAV…eLl`), buttons (disabled/soon): **Top up, Withdraw, Cash-in/out**, "Transfer dolphins (soon)".
- v1: wallet screen bana do par withdraw "Coming soon" rakho.

## 14. Reef Pass (Ducker Pass) — Monetization OBSERVED
Popup 3 tiers (green/blue/purple border cards):
| Tier | Daily reward | Perks | Price |
|---|---|---|---|
| **Pearl Prince** | 🐟 +5000 | +5% chance for dolphin after breeding, Auto-merge Pearls & Heart Pearls 1 levels, skip ads in tasks, unique skins, **turbo feed** | 🌟299 / 14 days |
| **Sea King** | 🐟 +10000 | +10%, auto-merge 1–3 levels, skip ads | higher |
| **VIP Leviathan** | more | Dolphin Trader, all above | highest |
- "Become Prince for 14 days" yellow CTA. Not-enough-stars → **Stars popup**: packs 75 / 500 / 1000 / 5000 / 10000 ⭐ (pill buttons, 3+2 grid) with mascot star character on top.
- Payment cancelled toast: white top pill "PAYMENT CANCELLED".

## 15. Duel Bonus & Energy (Home scroll)
- **Duel Bonus:** "Extra rewards for every 5 duels you play. Premium track = even more". Horizontal reward ladder (30, 35, 40, 45…) with CLAIMED ticks; button **UNLOCK REWARDS ⭐499**. → Hamare liye **"Dive Bonus"** (har 5 reef-dives pe reward).
- **Energy:** "The more you spin the wheel, the more valuable the prizes for your energy!" — `CLAIM` button, energy ladder.
- **Rewards Unlocked popup:** two cards: Free (✔ green) vs **PREMIUM** (blue button) — free reward + premium reward (golden/crown). Items: speaker box ×8, hatch pearl.

---

# PART B — ECONOMY

## 16. Currencies

| Currency | Type | Source | Sink |
|---|---|---|---|
| 🐟 **Fish** | Soft | Daily pass, wheel, tasks, collections, sell dolphin, ads | Feed, breeding fee, slot, market buy |
| ⭐ **Stars** | Premium | IAP (Telegram Stars), achievements, collection, task | Slots, Reef Pass, boosters, mega spin, market |
| 🔵 **DLP token** | Meta/airdrop | Passive per dolphin/hour | Withdraw (future), staking boosts |
| ❤ **Sea Hearts** | Event | Heart Pearls | Hearts milestones |
| 🐚 **Shells** | Tournament | Merge combos | Rank, chest |
| ◎ **Wheel tokens** | Utility | Tasks, dives | Spin |
| 🌊 **Wave points** | Utility | wheel, tasks | Instant Merge |

### 16.1 Faucet / Sink balance (daily, DESIGN)
Target: ek active F2P player daily ~ **60–80K Fish** kamaye aur ~ **55–70K** kharch kare (slow positive).

```
Faucets/day (F2P):
 Daily pass:          5,000
 Feeding yield:       ~20,000 (via DLP→fish conversion 1:… configurable)
 Tasks & challenges:  15,000
 Wheel:               ~10,000 avg
 Ads (5/day):         ~500–5,000
Sinks/day:
 Feed (6 dolphins × 8 feeds × avg 120):  ~5,800
 Breeding fee (3/day × 100–500):         ~900
 Market buy (optional):                  big sink
 Slot unlock:                            one-off
```
Fish ki value inflate na ho isliye **market + collection + god upgrade** hi mega sink rakho.

### 16.2 Conversion rates
- `1 Star ≈ 380–420 Fish` (market chart se: 160.9K fish ≈ 400 stars).
- Star price IAP: 75⭐=$1.5 ya Telegram Stars rate follow karo.

### 16.3 DLP passive formula
```
dlp_per_hour(dolphin) = base_rarity × (1 + 0.15×(level-1)) × pass_mult × god_mult × stake_mult
dlp_total_tick = Σ dlp_per_hour / 3600 per second
```
Display: counter 2 decimal, tick every 1s with smooth lerp.

---

## 16B. Dolphin Generation (Pearl → Dolphin)

Hatch result (DESIGN, Prince/King pass bonus ke saath):
| Pearl tier completed | Dolphin rarity chance |
|---|---|
| Tier 7–8 | Common 80 / Unc 18 / Rare 2 |
| Tier 9 | Unc 60 / Rare 30 / Epic 9 / Leg 1 |
| Tier 10 | Rare 55 / Epic 35 / Leg 10 |
Pass bonus: Prince +5% / King +10% shift to higher rarity.

---

# PART C — UI / UX STYLE GUIDE (bilkul same look)

## 17. Visual Identity (OBSERVED)

### 17.1 Colors
| Token | Hex | Use |
|---|---|---|
| bg-main | `#0D0F17` | app background (near-black navy) |
| bg-card | `#171A25` | cards/panels |
| bg-card-2 | `#1E2230` | inner rows |
| stroke-subtle | `#2A2F40` | borders |
| text-primary | `#FFFFFF` | numbers, titles |
| text-secondary | `#9AA0B4` | helper text |
| accent-gold | `#FFC933` | primary CTA (yellow buttons), selected |
| accent-orange | `#FF9F1C` | active tab, progress bar |
| fish-green | `#6BE35A` | Fish currency |
| star-blue | `#5B7CFF` | Stars |
| heart-pink | `#FF4D8D` | Hearts, combo badge |
| rarity-common | `#D8DCE8` | |
| rarity-uncommon | `#3DDC68` | |
| rarity-rare | `#3B82FF` | |
| rarity-epic | `#A855F7` | |
| rarity-legendary | `#FFC933` | |
| danger | `#FF3B3B` | badges |

**Dolphin brand tweak:** tumhara logo blue (`#1E90FF` → `#00D4FF` gradient) hai, isliye DLP counter ke aas-paas **cyan glow** rakho (original orange tha).

### 17.2 Typography
- Numbers/Headings: **Condensed bold** (like *Bebas Neue / Barlow Condensed / Oswald Bold*), ALL CAPS for titles.
- Body: **Inter / Roboto** 14–16px, grey.
- Sizes: DLP counter 64, titles 36–44, card title 28, body 22–24 (720 base), button 28.
- Godot: `FontVariation` + `LabelSettings` (outline 2px black for on-art text).

### 17.3 Components
1. **Primary Button:** pill, gold `#FFC933`, text black bold caps, height 88, radius 44, bottom shadow darker gold 6px; pressed: translate-y 4px + shadow shrink.
2. **Secondary Button:** dark `#2A2F40`, white text.
3. **Disabled:** grey `#3A3F52`, text 50%.
4. **Pill Chip (top bar):** dark glass, radius 40, icon + text.
5. **Card:** radius 28, 1px `#2A2F40` border, inner gradient top-light.
6. **Progress Bar:** height 28, bg `#0A0C12`, fill orange→yellow gradient, round cap, marker circle (level) at left.
7. **Badge:** red circle 36px, white number, top-right of tab icon.
8. **Toggle:** green on / grey off (ANIMATION toggle seen in wheel screen).
9. **Segmented Tabs:** active = white bg + black text; inactive = dark; pill.
10. **Toast:** white rounded rectangle top ("PAYMENT CANCELLED"), black text, auto-hide 2.5s.
11. **Modal:** dark card bottom-sheet slide up, close ✕ top-right, dim overlay 60%.
12. **Rarity Tag:** tiny colored text above grid item ("COMMON", "UNCOMMON (5+ LVL)", "RARE (5+ LVL)").

### 17.4 Spacing grid
8px base; screen padding 24; card gap 16; section gap 32.

### 17.5 Iconography
Flat-glossy 3D style, thick-ish rim, small shadow. Same style tumhare star + fish assets jaisi (glossy gradient). Naye icons (crown, gift, lightning, heart, pearl) usi style me.

---

# PART D — ANIMATION, UIFX, VFX

## 18. UI Animation Spec (Godot Tween)

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Screen change (tab) | Fade 0→1 + slide Y 24px | 0.22s | ease_out_cubic |
| Bottom sheet open | Slide from +600px | 0.30s | ease_out_back (overshoot 8%) |
| Modal close | scale 1→0.95 + fade | 0.18s | ease_in |
| Button press | scale 0.94 + shadow shrink | 0.08s down / 0.12s up (back) | ease_out |
| Button idle pulse (CTA) | scale 1↔1.04 | 1.2s loop | sine |
| Number count-up | digits roll up | 0.5s | ease_out_quad |
| Currency icon pickup | icon scale 1→1.25→1 on increase | 0.25s | ease_out_back |
| Red badge | pop scale 0→1.2→1 | 0.3s | back |
| Tab icon select | bounce y -8→0 + scale 1.15 | 0.25s | back |
| Dolphin card swipe | follow finger, snap | 0.28s | ease_out_cubic; neighbors parallax 0.6× |
| Dolphin idle | float y ±6px, rot ±1.5° | 2.4s loop | sine |
| Dolphin tap-feed | squash (1.08, 0.92) → stretch → settle | 0.25s | elastic_out |
| Float text "+150" | rise 80px + fade | 0.7s | ease_out; random x ±20 |
| Progress bar fill | width lerp + glossy shine sweep | 0.4s | ease_out |
| Level up | card flash white, ring burst, "LVL UP" text pop | 0.8s | — |
| Locked slot tap | shake x ±8 ×3 | 0.3s | — |
| Toast | slide down from -80 | 0.25s in / 0.2s out | back |
| List item stagger | each +40ms delay fade-slide | — | out_cubic |
| Skeleton/loader | circular spinner | 1s loop | linear |

**Rule:** UI animation 0.15–0.35s; reward animations 0.6–1.2s; kabhi bhi 1.5s se lamba block mat karo (skip on tap).

## 19. Gameplay Animation

### 19.1 Feeding
1. Tap → fish sprite player ke finger se dolphin ke muh tak **arc** (0.35s), dolphin `bite` squash.
2. +value float text (green fish icon).
3. Chhote **bubbles** 3–5 particles upar.
4. DLP counter per feed +0.02 floating text (video: "+0.02" faint).
5. Streak glow: har 10 consecutive feeds → card border pulse.

### 19.2 Breeding
- Popup me dono dolphins face-to-face, beech me **heart bubbles** float.
- Start: heart burst (12 particles), timer bar fill pink dots (10 dots, har 10% pe ek dot).
- Complete: pearl chest "shake ×3 → pop" → 3–5 pearls scatter on the board tab (badge +N bounce).

### 19.3 Pearl Board
- **Place pearl:** queue pearl first → cell: arc 0.25s + landing squash + "plop" ripple ring.
- **Merge:** matched pearls beech me slide (0.2s) → flash → naya pearl **scale 0→1.3→1** (back) + ring wave + **confetti** (video me confetti dikha: 20–30 colorful rectangles, gravity, 0.9s).
- **Combo badge (X13):** pink starburst top-left, scale-pop har combo pe, color heat: x1–4 pink, 5–9 orange, 10+ gold + screen shake 2px.
- **Chain merge:** har chain +60ms delay, pitch +1 semitone (audio).
- **Locked corner:** padlock jiggle on tap; unlock → lock break (2 halves fall) + dust.
- **Free chest timer cell:** floating bob; ready → shine sweep + sparkle.
- **Highlight cell (bright purple glow):** hint — jahan merge possible ho wahan pulse.
- **Hint system:** 5 sec idle → merge-possible group glow.

### 19.4 Wheel (see 7.2). Extra:
- LED lights on rim blink chase (0.1s).
- Winner: gold rays rotating behind popup, 40 sparkle particles.

### 19.5 Hatch / New Dolphin
1. Pearl shakes (3 times, increasing)
2. Crack lines glow
3. White flash (0.15s) + shockwave ring
4. Dolphin jumps out of water (arc), splash particles
5. Rarity banner: "NEW DOLPHIN — EPIC!" with rarity-color rays
6. Dolphin lands in slot dots (fly to dot, dot turns green with pop)

### 19.6 Collection "Feed and Add"
- Dolphin card shrinks → flies into collection grid cell → cell border flash green, "ADDED" tag stamp (scale 2→1, rotate -8°, 0.25s) + coin shower if collection complete.
- Collection complete: full-screen reward popup: trophy bounce, rays, count-up rewards, "CLAIM".

### 19.7 Market
- Hot market bid timer ring depletes; at last 5 sec red pulse.
- Buy success: buy button turns green ✔, card slides out left, new card slides in right.
- Price chart line draws left→right 0.6s.

## 20. VFX List (lightweight — GPUParticles2D / CPUParticles2D)

| VFX | Type | Count | Life | Notes |
|---|---|---|---|---|
| Bubbles (ambient) | CPUParticles2D | 12 | 4–7s | white 30% alpha, rise + sway; 1 emitter per screen |
| Light rays (reef) | Sprite additive | 3 | loop | slow rotate ±3°, 6% alpha |
| Confetti | CPUParticles2D one-shot | 30 | 1.0s | 5 colors rectangles |
| Sparkle star | one-shot | 8–20 | 0.6s | 4-point, additive |
| Ring wave | Sprite scale+fade | 1 | 0.5s | additive |
| Splash | one-shot | 14 | 0.7s | blue droplets, gravity |
| Heart burst | one-shot | 12 | 0.9s | pink hearts, scale down |
| Coin/Fish shower | one-shot | 20 | 1.2s | fall + bounce |
| Rarity glow | shader outer glow | – | loop | color by rarity |
| Legendary aura | animated sprite | – | loop | gold swirl behind card |
| Shine sweep (UI) | shader/mask | – | 1.5s every 4s | diagonal white strip on CTA, pearls, prize cards |
| Underwater caustics | scrolling texture | – | loop | 8% alpha on bg |
| God aura | particles + glow | 20 | loop | per god color |
| Screen flash | ColorRect | – | 0.15s | white 50% |
| Screen shake | Camera offset | – | 0.2s | ±2–4px |

**Performance budget:** max 120 live particles per screen, no per-pixel heavy shaders; low-end mode toggle (`ANIMATIONS` toggle — video me wheel pe dikha hai) jo particles 50% kam kar de.

## 21. Audio Design
| Event | Sound |
|---|---|
| Tap/feed | soft "bloop" (pitch random ±5%) |
| Fish pickup | tiny coin-water ping |
| Merge | marimba/bell note, pitch +1 semitone per chain |
| Big combo | cymbal swell + whoosh |
| Hatch | crack ×3 + sparkle + dolphin chirp |
| Wheel tick | wooden click; win = fanfare |
| UI click | bubble pop |
| Level up | ascending 3-note harp |
| Error/locked | low thud |
| Ambient music | calm underwater loop (60–90s) + bubbles |
Dolphin voice: 3–4 chirp/click samples (happy/smug alag).

---

# PART E — TECHNICAL (GODOT)

## 22. Project Structure
```
res://
 ├─ autoload/       GameState.gd, Economy.gd, SaveSystem.gd, Net.gd, Audio.gd, Telegram.gd, Time.gd
 ├─ data/           dolphins.json, pearls.json, collections.json, wheel.json, tasks.json, passes.json, gods.json
 ├─ scenes/
 │   ├─ shell/      Main.tscn, TopBar.tscn, BottomNav.tscn, Toast.tscn, ModalHost.tscn
 │   ├─ dolphins/   DolphinsScreen.tscn, DolphinCard.tscn, SlotRow.tscn, BreedBar.tscn, BreedPopup.tscn
 │   ├─ pearls/     PearlBoard.tscn, Pearl.tscn, PearlQueue.tscn
 │   ├─ market/     MarketScreen.tscn, HotCard.tscn, PriceChart.tscn, Trader.tscn
 │   ├─ gods/       GodsScreen.tscn, GodCard.tscn
 │   ├─ tasks/      TasksScreen.tscn, TaskRow.tscn, tabs/*
 │   ├─ wheel/      Wheel.tscn
 │   ├─ collections/Collections.tscn, CollectionCard.tscn, CollectionDetail.tscn
 │   ├─ pod/ wallet/ pass/
 ├─ ui/             theme.tres, fonts/, styleboxes/, icons/
 ├─ fx/             confetti.tscn, ring.tscn, splash.tscn, hearts.tscn, shine.gdshader, glow.gdshader
 └─ art/            dolphins/, pearls/, skins/, gods/, bg/
```

## 23. Key Systems

### 23.1 Architecture
- **Signals bus** (autoload `Events.gd`): `fish_changed, stars_changed, dolphin_fed, breeding_started, pearl_merged, reward_claimed, tab_changed`.
- **Data-driven:** sab numbers JSON/Resource me (balance bina code change).
- **Server-authoritative economy** (Telegram game, cheat-proof): client sirf UI; server (Node/Go + Postgres/Redis) feed/breed/market validate kare. v0 prototype ke liye local save.

### 23.2 Timers
- Server timestamp (`ready_at`) save karo; client sirf countdown dikhata hai (`Time.get_unix_time_from_system()` − offset). Offline progress: `now − last_seen` pe breed/feed reset compute.

### 23.3 Save/Data schema
```json
{
 "user": {"id":"tg_123","name":"..","pass":"prince","pass_until":1760000000},
 "wallet": {"fish":92935,"stars":50,"dlp":183.49,"hearts":81105,"shells":65,"wheel":250,"wave_unc":473,"wave_rare":1040},
 "dolphins":[{"id":"d1","skin":"dj","rarity":"uncommon","level":5,"feeds":5,"feed_reset_at":0,"breed_ready_at":0,"state":"active","slot":0,"staked_until":0}],
 "slots_unlocked": 8,
 "pearl_board":{"grid":[[1,0,3,...]],"locked":[[0,0],[0,6],[6,0],[6,6]],"queue":[1,1,2,1],"combo":13},
 "collections":{"music_award":{"added":["d_skin_1"],"claimed":false}},
 "tasks":{"daily_reset":1760000000,"progress":{"feed":12,"merge":30}},
 "market":{"listings":[],"trader":{"sell":[],"buy":[]}},
 "gods":[], "pod":{"id":null}
}
```

### 23.4 Pearl Board Algorithm (merge)
```gdscript
func try_place(cell: Vector2i, tier: int):
    grid[cell] = tier
    var group := flood_fill(cell, tier)      # 4-neighbors
    if group.size() >= merge_min:            # 3 (config)
        var new_tier = tier + (1 if group.size() < 5 else 2)
        for c in group: grid[c] = 0
        grid[cell] = min(new_tier, MAX_TIER)
        combo += 1
        emit_signal("merged", group, new_tier, combo)
        await get_tree().create_timer(0.12).timeout
        try_place(cell, grid[cell])           # chain
    else:
        combo_timer.start(3.0)
```

### 23.5 Telegram integration
- Godot HTML5 export + `JavaScriptBridge` → `window.Telegram.WebApp` (initData, user, haptics, `openInvoice` for Stars, `shareToStory`).
- **Haptics:** feed = light, merge = medium, jackpot = heavy (`HapticFeedback.impactOccurred`).
- Safe areas: `WebApp.safeAreaInset`.
- Web export size: texture compression (WebP), atlas sheets, audio OGG 96kbps → target initial load < 25 MB.

### 23.6 Performance (low-end Android)
- Texture atlases, 2048 max; no HDR, 2D renderer "Compatibility".
- Pearl board 49 nodes — saste; ek `Sprite2D` + shader glow only on top-tier.
- Pool particles, limit tweens, `Engine.max_fps = 60` (battery saver 30).

---

# PART F — META

## 24. FTUE (First Time User Experience), 3 min
1. Splash (logo shine, 1.5s) → "Welcome to Dolphin Pearl".
2. Free Common dolphin card + pointer: "TAP TO FEED" ×5 (hand cursor).
3. Level up animation → "BREED unlocked" highlight.
4. Breed → "Use a free booster" (instant) → pearls 6 mile.
5. Go to PEARLS tab → forced merge tutorial (3 same → merge) → confetti.
6. Hatch free Uncommon dolphin → slot unlock.
7. Daily pass claim + Wheel free spin.
8. Tasks tab pointer → first task claim → Stars 10.
Rule: har step me sirf 1 highlight, baaki screen dim.

## 25. Live Ops
- Daily reset (UTC 00:00), Weekly tournament Monday, Monthly new collections ("New collections coming soon" placeholder card — video me).
- Events: Crazy Market, Pearl Rain (2× drop), Heart Festival.
- Push via Telegram bot: "Your dolphin finished breeding!", "Market is HOT".

## 26. Monetization
1. Reef Pass (Prince/King/VIP) — main.
2. Star packs (75–10,000).
3. Slots, boosters, mega spin, Dive Bonus premium track.
4. Rewarded ads (skip for pass).
5. Ocean Gods mint (optional, later).
Target: ARPPU focus on whales via Market + Gods; F2P gets 70% fun without paying.

## 27. Analytics events
`session_start, feed, level_up, breed_start/complete, pearl_place, merge(combo,tier), hatch(rarity), wheel_spin, collection_add/complete, market_buy/sell, iap, ad_view, task_claim, pass_view/buy, tutorial_step, d1/d7/d30`.
KPIs: D1 ≥ 40%, D7 ≥ 15%, sessions/day ≥ 6, ARPDAU, market liquidity.

## 28. Asset Production List (jo banana hai)

**Tumhare paas already:** blue eye-wing logo ✅, gradient star ✅, blue fish ✅, dolphin happy ✅, dolphin smug ✅.

**Banana baaki:**
- Dolphin: 5 rarity frames, 2 more moods (sleepy, excited), accessory layers (30+), skins 50+ pehle phase me
- Pearls: 10 tiers + locked + chest + hatch-crack frames
- UI kit: buttons, tabs, chips, progress bars, badges, modals, toggle
- Icons: crown, gift, lightning, heart, shell, wave, key, trophy, gear, pill (6/12/24h), hourglass
- Collections icons (30 themes), Gods (6 big illustrations)
- Backgrounds: reef stage (pearl board), dolphin home bg, market bg, wheel
- Wheel: rim, segments, pointer, spin button
- FX sprites: bubble, sparkle, confetti, ring, ray, splash, heart
- Audio: 25 SFX + 1 BGM

## 29. Development Roadmap (solo/small team)
| Phase | Weeks | Deliverable |
|---|---|---|
| 0 Prototype | 1–2 | Shell + Dolphins screen + feed + save |
| 1 Core | 3–5 | Breeding timer, Pearl board merge, hatch |
| 2 Meta | 6–8 | Wheel, Tasks, Collections, Pass popup |
| 3 Economy | 9–11 | Market, server, anti-cheat, Pod |
| 4 Polish | 12–14 | FX, audio, FTUE, perf, Telegram integration |
| 5 Soft launch | 15+ | Analytics, balance, Gods, events |

## 30. Risks
- **Copyright/Trade dress:** "bilkul same" copy karoge to original game ka UI/art/name/skin concept ke saath issue ho sakta hai. Mechanics copy karna theek hai, par **art, naam, text, icons, layout pixel-by-pixel** mat copy karo — tumhari dolphin identity (logo, colors, fish/star) use karo. Same *pattern* rakho, par assets apne.
- **Crypto/NFT/token:** DLP withdraw, NFT mint me legal/KYC issues — v1 me "coming soon".
- **Inflation:** Fish sinks monitor karo (market fee 5%, collection upgrades).
- **Server load:** market FIFO queue + Redis.

---

## 31. Open Questions (tum decide karo)
1. Pearl merge: **Match-3** ya **Merge-2**? (default: match-3)
2. Real token/NFT chahiye ya sirf in-game points?
3. Telegram Stars se IAP ya sirf Android/iOS stores?
4. Dolphin collection skins pehle launch me kitni (suggest: 6 collections × 24 = 144)?
5. Multiplayer breeding partner real players ya AI bots (v1 me bots easy)?

---
*Document version 1.0 — video (9 min, 547s) ke 90+ frames analyze karke banaya. Agle step me chaho to main har screen ka detailed wireframe (pixel layout) ya Godot starter project structure/code bana sakta hu.*
