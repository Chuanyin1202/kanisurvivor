
# CLAUDE.md

This file provides project-wide guidance for Claude Code when working with the "Kani: Pixel Mage Survivor" game codebase.

## 🎮 Project Overview

"Kani: Pixel Mage Survivor" is a fast-paced HTML5 bullet-hell roguelike starring Kani, a pixel-style fantasy cat mage. The game combines action-packed survival gameplay with long-term character progression and Diablo-like item systems.

### Key Features:
- Pixel-art fantasy aesthetics, HTML5-based
- Mouse/touch control with smooth spell shooting
- 10–15 minute intense game sessions
- Persistent gold and unlockable equipment via the shop
- RPG mechanics (damage numbers, loot, leveling)
- Achievement & platinum trophy system

## 🧙 Main Character: Kani

- Gray/white gradient folded-ear cat, round face, expressive brows
- Role: Wand-wielding mage
- Uses elemental and arcane spells in bullet-hell combat
- Visual inspiration: British Shorthair + Tarot card style

## ⚙️ Architecture & Game Loop

- **HTML5 + Vanilla JavaScript**
- **main.js** contains the `Game` class and the render loop (requestAnimationFrame)
- Separate modules for `Player`, `UIManager`, `WaveManager`, `Drone`, etc.
- Custom `ObjectPool` system for performance
- Canvas-based rendering + visual effects

## 🛠️ Core Modules

### Player System (`player.js`)
- Handles movement (mouse/touch), spellcasting, dash
- Stats: Attack, Defense, Crit Chance, Crit Damage
- Equipment affects stats and appearance
- Supports combo, killstreak, and drone summons

### Enemy & Wave System (`waveManager.js`)
- Enemies spawn from screen edges
- Difficulty scales over time
- Bosses appear after survival threshold

### Loot & Economy
- Gold drops persist across runs
- In-game store on the main screen for purchasing:
  - Weapons, Armor, Sets
  - Each item has stats, rarity, upgrade paths
- Set bonus system (e.g., full green set unlocks effects)

### Trophy & Achievement System
- In-run achievements (first kill, combos, time survived)
- Platinum trophy unlocked by collecting all
- Achievements unlock new shop items or power-ups

## 🧠 Game Data

- **LocalStorage** is used for:
  - Best scores, total kills
  - Unlocked gear, gold, achievement states

## 📐 Visual UX

- All UI is DOM-based, styled with CSS
- Responsive for mobile and desktop
- Pause/Menu/Status overlays built into `.screen-overlay`
- Damage numbers float from enemies on hit
- Button feedback: glow, scale, hover animations

## 💡 Claude Code Instructions

Claude, please help with:
- Improving modularity (split oversized files)
- Auto-generating item/skill templates
- Suggesting scalable architecture for equipment and upgrade logic
- Enhancing UI clarity for mobile
- Identifying redundant logic, improving readability

Do **NOT**:
- Translate Chinese comments or identifiers
- Modify any files under `/legacy/`
- Auto-delete "placeholder" assets used in early prototyping

Language preference: **中文繁體回覆**

## 🔌 Suggested MCP Integrations

To enhance Claude's capability, the following MCP Servers are recommended:

| MCP Tool            | Purpose                                 |
|---------------------|------------------------------------------|
| `mcp-image-gen`     | Generate pixel-art assets (Kani, monsters, tiles) |
| `mcp-ui-reviewer`   | Audit UI hierarchy and spacing issues    |
| `mcp-dialog-writer` | Help write achievement or item descriptions |
| `mcp-prototype-pitch` | Generate Steam store pitch and promo copy |

These can be activated via Claude Desktop or Claude CLI when available.

## 📂 File Structure (Expected)

```
project-root/
├── index.html
├── main.js
├── player.js
├── waveManager.js
├── drone.js
├── uiManager.js
├── styles/
│   └── main.css
├── assets/
│   └── kani.png, spells.png, etc.
├── CLAUDE.md
├── README.md
└── legacy/
```
