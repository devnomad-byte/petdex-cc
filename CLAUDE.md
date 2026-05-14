# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run build          # tsc + copy assets + esbuild renderer bundle
npm run check          # tsc --noEmit (type check only)
npm run dev            # Run main process directly via tsx
npm start              # node dist/bin/cli.js start
```

No automated test framework. Manual test plan at `docs/test-plan.md`.

## Architecture

Three-layer system communicating via HTTP and Electron IPC:

```
Claude Code hooks → bridge.sh/.ps1 → HTTP POST localhost:17321/event
                                          ↓
                                    Electron main process
                                          ↓ IPC
                                    Renderer (pet UI)
```

**CLI** (`bin/cli.ts` → `src/cli/`): 8 commands — install, start, stop, list, switch, status, uninstall, config. The `start` command spawns the Electron binary pointing at `src/main/index.ts`.

**Main process** (`src/main/`):
- `index.ts` — app lifecycle, window creation, IPC bridge
- `server.ts` — HTTP server on port 17321 (auto-increments)
- `event-mapper.ts` — maps Claude Code events to pet actions (PetAction type)
- `storage.ts` — state persistence at `~/.petdex-cc/data/state.json` with HMAC-SHA256 tamper detection
- `ai-speech.ts` — calls Anthropic API (claude-haiku) for dynamic speech, 2-min cooldown
- `tray.ts` — system tray icon

**Renderer** (`src/renderer/`):
- `renderer.ts` — master coordinator, receives IPC, drives sprite/bubble/effects
- `pet-sprite.ts` — CSS spritesheet engine, 9 animation states, 192x208px frames
- `bubble.ts` — speech bubble with timeout (3s preset, 8s AI)
- `click-through.ts` — transparent pixel pass-through
- `drag.ts` — drag-to-move + click easter egg
- Bundled by esbuild into a single IIFE `renderer.js` (not loaded as module)

**Hooks** (`src/hooks/`):
- `register.ts` — modifies `~/.claude/settings.json` to register 8 hook events
- Uses marker string `petdex-cc-bridge` in commands for idempotent updates
- Bridge scripts (`bridge.sh`, `bridge.ps1`) read JSON from stdin, POST to localhost

**Shared** (`src/shared/`): PetAction types, pet state definitions (9 states × row/frames/duration), level thresholds (8 levels: Byte→Singularity, 0→10000 events).

**Petdex API** (`src/petdex-api/`): Fetches manifest from `petdex.crafter.run`, downloads spritesheets to `~/.petdex-cc/pets/{slug}/`.

## Build Pipeline

Three-step build (`npm run build`):
1. `tsc` compiles all TS to `dist/`
2. `build-copy.mjs` copies `index.html` and `tray-icon.png` to dist
3. esbuild bundles `renderer.ts` into IIFE `renderer.js` (externalizes electron)

The renderer cannot use ES modules — it's loaded as a plain `<script>` tag in `index.html`.

## Key Conventions

- ESM throughout (`"type": "module"` in package.json, NodeNext in tsconfig)
- Path alias: `@/*` → `./src/*`
- User data lives in `~/.petdex-cc/` (pets, data, config)
- Level system uses HMAC signed state to prevent tampering (key from machine ID)
- AI speech defaults to Chinese responses; falls back to preset lines on timeout
- Hooks run async with 10s timeout — silently fail if pet isn't running
