## Context

Petdex is a public gallery for Codex-compatible animated pets at https://petdex.crafter.run. It hosts 1300+ animated pixel pets with a standard spritesheet format (1536x1872px, 8 columns x 9 rows, 192x208px frames, CSS `@keyframes` animation). Petdex's official CLI (`npx petdex install`) installs pets into `~/.codex/pets/` — designed only for Codex, not Claude Code.

Claude Code has a robust hooks system (26+ lifecycle events) that supports async shell commands receiving JSON event data via stdin. This provides all the signals needed for a desktop companion to react to coding activity.

Currently there is no visual companion for Claude Code sessions. Users interact purely through terminal text for hours at a time.

## Goals / Non-Goals

**Goals:**
- One-command install experience: `npx petdex-cc install <pet-name>`
- Transparent, always-on-top desktop pet that doesn't interfere with work (click-through outside pet area)
- Real-time reactions to Claude Code activity via hooks (no API cost for basic reactions)
- AI-powered personality speech at key moments, reusing existing API credentials
- Gamification through 8-level evolution system with visual effects
- Cross-platform: Windows 10/11, macOS, Linux

**Non-Goals:**
- Building or modifying the Petdex platform itself
- Multi-pet display (one pet at a time, switchable via CLI)
- Sound effects or voice synthesis
- Network multiplayer or pet sharing
- Mobile support
- Replacing or competing with the official `petdex` CLI

## Decisions

### Decision 1: Electron over Tauri / native / Flutter

**Choice**: Electron with transparent BrowserWindow

**Rationale**: All TypeScript as user requested. Electron's transparent window + always-on-top + click-through (`setIgnoreMouseEvents`) is well-documented and consistent across platforms. Tauri requires Rust. Native requires three codebases. Flutter desktop has poor transparent window support.

**Alternatives considered**:
- Tauri: Smaller binary but requires Rust — contradicts "one language" requirement
- Pure native: Best performance but 3x maintenance cost
- Flutter: Animation system is good but desktop transparent window support is immature

### Decision 2: HTTP bridge over IPC / file watching / WebSocket

**Choice**: Local HTTP server on port 17321, hooks POST via curl

**Rationale**: Hooks are async shell commands that naturally produce `curl` calls. HTTP is stateless, trivial to debug, and fails gracefully (curl silently fails if Electron isn't running). No connection management overhead.

**Alternatives considered**:
- WebSocket: More complex, requires connection lifecycle management
- File watching: Requires polling, filesystem race conditions
- Direct IPC: Hooks run in separate processes, no access to Electron IPC

### Decision 3: Event counting for levels instead of token tracking

**Choice**: Count cumulative hook events

**Rationale**: Hooks cannot access Claude Code's token usage. Event count is a reasonable proxy — more events = more activity. The thresholds are calibrated to feel rewarding over days/weeks of use.

### Decision 4: HMAC anti-cheat with machine-derived key

**Choice**: Sign state.json with HMAC using a key derived from machine ID

**Rationale**: Prevents trivial JSON editing to max out levels. Not cryptographically unbreakable (determined users can extract the machine ID), but raises the bar enough for a fun gamification feature. Full DRM is not the goal.

### Decision 5: Merge hooks into existing settings.json

**Choice**: Read → parse → merge → write, with backup

**Rationale**: Users may have existing hooks. Overwriting would break their setup. The installer creates a backup file and only adds/updates petdex-cc hooks without touching other entries.

## Risks / Trade-offs

- **Electron binary size (~100MB)** → Mitigation: download only on first install, not bundled in npm package. Use `electron` as an optional peer dependency.
- **Port 17321 conflict** → Mitigation: Try up to 10 ports (17321-17330) on startup. Store actual port in `~/.petdex-cc/data/port.lock` so bridge scripts can read it.
- **Claude Code hooks format changes** → Mitigation: Hooks API is stable and well-documented. Pin to documented event names only.
- **Petdex API unavailability** → Mitigation: Bundle one default pet sprite in the npm package. CLI `list` command shows cached results when offline.
- **Click-through detection reliability** → Mitigation: Use hit-testing on the actual sprite bounds (192x208 rect), not the full window. Test on all three platforms.
- **macOS transparent window permissions** → Mitigation: Electron transparent windows work on macOS without special permissions. Document any Gatekeeper warnings in install output.
