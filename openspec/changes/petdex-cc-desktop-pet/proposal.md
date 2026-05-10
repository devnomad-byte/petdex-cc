## Why

Claude Code is a powerful CLI tool, but it lacks any visual companion or personality during long coding sessions. Petdex hosts 1300+ animated pixel pets designed for Codex, but these pets are only usable inside Codex — not Claude Code. Users spend hours in Claude Code with zero visual feedback beyond terminal text. A desktop pet companion would make coding sessions more engaging, provide at-a-glance awareness of what Claude is doing, and add a gamification layer (level progression) that rewards sustained usage.

## What Changes

- **New npm package `petdex-cc`**: A CLI tool that installs a desktop pet companion for Claude Code
- **Electron transparent pet window**: An always-on-top, frameless, click-through desktop window that renders Petdex sprite animations
- **Claude Code hooks integration**: Registers async hooks in `~/.claude/settings.json` that POST event data to a local HTTP server, enabling real-time pet reactions to file reads, code edits, command execution, task completion, and errors
- **Pet asset fetching from Petdex API**: Downloads approved pets from `petdex.crafter.run/api/manifest` — reuses the existing public API and CDN, does not require a Petdex account
- **Cartoon speech bubbles**: Pet shows contextual messages ("Reading src/auth.ts...", "Task complete!") and time-aware greetings ("Have you eaten?") above its head
- **AI-powered speech**: On key moments (task done, errors, idle, level-up), the pet uses the user's existing Claude Code API credentials to generate personality-aware dialogue with a 2-minute cooldown
- **Level evolution system**: 8 tech-themed levels (Byte → Singularity) based on cumulative hook events, with escalating visual effects and encrypted local storage to prevent cheating
- **Full-screen pet wandering**: Pet roams the entire screen freely, bounces off edges, can be dragged, responds to clicks with animations, and has a right-click context menu
- **Cross-platform support**: Windows 10/11, macOS, Linux — all TypeScript, all Electron

## Capabilities

### New Capabilities

- `cli-installer`: CLI commands (install, start, stop, list, switch, status, uninstall, config) and Petdex API client for fetching pet assets
- `hooks-bridge`: Claude Code hooks registration, bridge scripts (bash/PowerShell), and local HTTP server that receives hook events
- `pet-window`: Electron BrowserWindow with transparent click-through, sprite animation renderer, auto-wander, drag, click interaction, and right-click context menu
- `speech-bubbles`: Cartoon speech bubble component with contextual messages, time-aware greetings, and bubble lifecycle management
- `ai-speech`: AI dialogue generation using user's Claude Code API credentials, cooldown management, and fallback to preset lines
- `level-system`: Event counting, 8-level progression with visual effects, encrypted state persistence, and anti-cheat HMAC verification

### Modified Capabilities

(None — this is a new project with no existing capabilities to modify.)

## Impact

- **New project**: Created at `D:\petdex-project\petdex-cc\`, independent from `petdex-main`
- **User's `~/.claude/settings.json`**: Modified during install to add async hooks (merged, not overwritten; backup created)
- **New directory `~/.petdex-cc/`**: Created on user's machine for pet assets, state data, hooks scripts, and config
- **Runtime dependency**: Electron (~100MB download on first install)
- **Network**: Calls Petdex public API on install/list; optionally calls AI API for speech generation
- **Ports**: Local HTTP server on port 17321 (localhost only)
