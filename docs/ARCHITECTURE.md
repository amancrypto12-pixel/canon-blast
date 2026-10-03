# System Architecture & Technical Specification

## 1. Architectural Overview
The application is engineered as a high-performance, single-bundle Telegram Mini App (TMA) designed for zero-latency loading, 60 FPS animations, and native hardware haptic feedback across mobile devices.

```
┌─────────────────────────────────────────────────────────────┐
│                    TELEGRAM CLIENT (APP)                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │               TELEGRAM WEBAPP SDK                   │   │
│   │    - initDataUnsafe (User Avatar, Name, ID)         │   │
│   │    - HapticFeedback (Impact, Notification)          │   │
│   │    - Viewport (Ready, Expand, Fullscreen)           │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │            CLIENT FRONTEND RUNTIME                  │   │
│   │    - DOM Viewport Manager (5-Tab Router)            │   │
│   │    - Procedural WebAudio Synthesizer Engine         │   │
│   │    - Ambient Canvas Particle Simulation (2D)        │   │
│   │    - Local State & Countdown Timers                 │   │
│   │    - Asset Pipeline (24 Eggs, Hero Sprites, Icons)  │   │
│   └─────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────▼───────────────┐
               │    VERCEL EDGE DEPLOYMENT     │
               │   - vercel.json Rewrite Rules │
               │   - Root Static Deliveries    │
               │   - GitHub Auto-Deploy CI/CD  │
               └───────────────────────────────┘
```

---

## 2. Component Subsystems

### 2.1 Telegram WebApp Bridge
- **User Authentication & Hydration**:
  - Direct extraction of `Telegram.WebApp.initDataUnsafe.user`.
  - Automatic fallback rendering: Real Telegram profile photo via `user.photo_url` -> First-name Initial Letter badge.
  - Username sanitization (`@username` or `First Name`).
- **Native Haptics**:
  - `impactOccurred('light')` on tap actions.
  - `impactOccurred('medium')` on toggle / staking.
  - `impactOccurred('heavy')` on chest opening and egg hatching.

### 2.2 Procedural WebAudio Synthesizer Engine
- Zero external audio assets required; synthesized directly via browser Web Audio API:
  - **Tap Sound**: Sine-wave pitch bend `320Hz -> 160Hz` (100ms decay).
  - **Coin Chime**: Dual sine oscillator chime `800Hz -> 1200Hz` (200ms decay).
  - **Fanfare Chord**: Arpeggiated triangle wave quartet `440Hz / 554Hz / 659Hz / 880Hz` (450ms sustain).

### 2.3 Canvas 2D Ambient Particle Layer
- 22 floating glowing cyan micro-orbs rendered on a non-blocking background `<canvas>` with velocity dampening, resize listeners, and `requestAnimationFrame` loop.

### 2.4 State Management & Micro-Animations
- **Reactive State Object**:
  ```javascript
  gameState = {
    tokens: 183.35,
    fish: 91339,
    stars: 45,
    hearts: 45,
    staminaResetSeconds: 21759,
    isStaked: false
  }
  ```
- **Micro-Interactions**:
  - Hero squash & stretch physics (`transform: scale(0.92, 1.10)`).
  - Dual simultaneous floating combo counters on feed action.
  - Modal spring entry with keyframe easing.

---

## 3. Directory Layout
```
/
├── index.html                   # Mirrored root entry point for Vercel
├── vercel.json                  # Clean URL & asset routing configuration
├── public/
│   ├── index.html               # Main production client bundle
│   └── assets/                  # High-res transparent 2D game assets
│       ├── blue_token_coin.png  # User-provided Blue Token Coin
│       ├── icon_user_fish.png   # Header & tap Fish currency
│       ├── icon_user_star.png   # Telegram Stars currency
│       ├── dolphin_hero_stage.png
│       ├── dolphin_hero_icon.png
│       ├── heart_egg_lvl[1-12].png
│       ├── pearl_egg_lvl[1-12].png
│       └── pack_chest.png, breeding_nest.png, etc.
└── docs/                        # Project specifications & guidelines
    ├── PRD.md
    ├── ARCHITECTURE.md
    ├── RULES.md
    ├── DESIGN.md
    ├── TASKS.md
    └── MEMORY.md
```
