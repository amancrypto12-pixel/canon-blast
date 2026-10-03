# 06 — ASSET SPEC

## 1. Style guide
Glossy 3D-cartoon, thick dark outline (like tumhare dolphin art), blue/cyan brand, soft inner highlights, small drop shadow. Transparent PNG/WebP. Consistent light source: top-left.

## 2. Already available (tumhare paas)
| Asset | Use |
|---|---|
| Blue eye-wing logo | App logo, DLP currency icon, loading splash |
| Gradient star | Stars currency |
| Blue fish | Fish currency, feed icon |
| Dolphin happy | Idle/happy mood, base for skins |
| Dolphin smug | Cooldown/breeding/max-level mood |
→ Inko `art/dolphins/base_happy.png`, `base_smug.png`, `art/icons/` me rakho. Background remove (transparent) check karo.

## 3. Naming convention
`category_name_variant@size.webp` e.g. `icon_fish_01.webp`, `pearl_t07_heart.webp`, `skin_pirate_01.webp`, `bg_home_reef.webp`, `fx_confetti_01.webp`.

## 4. Sizes
| Type | Size |
|---|---|
| Dolphin art (full) | 1024×1536 |
| Dolphin card render | 540×760 |
| Skin layer (accessory) | 1024×1536 same canvas (aligned) |
| Pearl | 256×256 |
| Icons | 128×128 (export 256) |
| Collection icon | 256×256 |
| God art | 1024×1024 |
| Backgrounds | 720×1600 (+ extra 10% bleed) |
| Wheel segments/rim | 1024×512 half-wheel |
| FX sprites | 128–256 |
| App icon | 512×512 |

## 5. Asset list

### Dolphins
- [ ] Rarity frames ×5 (common…legendary) + glow
- [ ] Moods: sleepy, excited, hungry (+ existing happy/smug)
- [ ] Accessory layers ×30 (hats, glasses, armor, props) aligned to base canvas
- [ ] Skins ×144 (6 collections × 24) via layers
- [ ] Silhouette (collection empty) ×1, locked dolphin, new-dolphin lock

### Pearls
- [ ] Tier 1–10 (plain, shell, sea glass, blue, violet, coral, heart, golden, royal, leviathan)
- [ ] Locked grey pearl, queue pearl, free chest + timer, hatch crack ×4 frames

### UI kit
- [ ] Buttons (primary, secondary, disabled), chips, tabs, progress bar parts, badges, toggle, modal frame, toast, tag (tilted white), card frames
- [ ] Bottom nav icons ×5 (market, pearls, dolphins, gods, tasks) ×2 states
- [ ] Icons: crown, gift, lightning, heart, shell, wave, key, trophy, gear, pill 6/12/24h, hourglass pill, lock, plus, info, refresh, check, wallet, pod
- [ ] Currency icons: fish, star, DLP, hearts, shells, wheel token, wave points
- [ ] Pass cards ×3 art, Star-pack mascot (star character)

### Screens/BG
- [ ] bg_home_reef, bg_pearls_stage (reef stage with lights), bg_market, bg_wheel, bg_gods, bg_tasks banner ("Take the new challenge")
- [ ] Caustics tile, light-ray, bubble sprites

### Wheel
- [ ] Rim, 10 segment backgrounds, pointer, spin button (yellow), LED dots, prize icons

### Collections (launch 6 × 24)
Pirate Cove (Captain Fin), Coral Carnival, Frozen Fjord, Atlantis Games, Maya Reef, Reef Music Award + Power sets (Common/Uncommon/Rare Current).
- [ ] 30 collection icons (256), 144 skins, prize icons

### Gods
- [ ] Love God, Hype God, Harvest God (Poseidon, Mermaid Queen, Kraken Lord) 1024² + medallions 3

### FX
- [ ] confetti, sparkle, ring, ray, splash, heart, bubble, fish-shower, shine mask, glow masks

### Audio
- [ ] 25 SFX (list in 02_UI_SPEC §9), 1 ambient BGM loop 60–90s, dolphin chirps ×4

## 6. AI image prompts (copy-paste)
Common suffix: `glossy 3D cartoon game asset, thick dark outline, vibrant, soft highlights, centered, transparent/white background, no text, mobile game icon style`

- **Pearl tier 1:** "single cream-white pearl in half shell, glossy" + suffix
- **Pearl heart:** "pink-red heart-shaped gem inside a golden pearl shell, sparkle" + suffix
- **Pearl leviathan:** "rainbow glowing legendary pearl with swirling aura" + suffix
- **Dolphin accessory pirate:** "pirate hat and eyepatch only, no character, aligned to front-facing" + suffix
- **Reef stage bg:** "underwater reef stage with spotlights, bioluminescent corals, dark navy purple, vertical mobile game background, empty center"
- **God Poseidon:** "chibi poseidon with trident riding a cloud of waves, gold armor, cartoon epic, detailed"
- **Wheel rim:** "ornate gold and blue half wheel rim with LED lights, game UI"
- **Star-pack mascot:** use existing gradient star, add cute face + sparkle

## 7. Consistency checks
- Same outline thickness (6–8px at 1024).
- Same palette (blue family + gold accents).
- Alpha edges clean (no white halo). Export WebP lossless for UI, lossy q90 for BG.
- Atlas pack per screen to keep draw calls low.
