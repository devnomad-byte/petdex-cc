## 1. Project Scaffolding

- [x] 1.1 Initialize npm project at `D:\petdex-project\petdex-cc\` with `package.json` (name: petdex-cc, bin, type: module, scripts: dev/build/start)
- [x] 1.2 Install dependencies: electron, typescript, tsx (runner), node-machine-id, @anthropic-ai/sdk
- [x] 1.3 Create `tsconfig.json` with strict mode, ES module output, path aliases for `@/`
- [x] 1.4 Create directory structure: src/main/, src/renderer/, src/hooks/, src/cli/, src/shared/, src/petdex-api/, assets/

## 2. Shared Types and Constants

- [x] 2.1 Create `src/shared/pet-states.ts` — 9 pet action states with row/frame/duration (copied from Petdex pet-states.ts)
- [x] 2.2 Create `src/shared/events.ts` — TypeScript types for all hook event payloads (PostToolUse, Stop, Notification, etc.)
- [x] 2.3 Create `src/shared/levels.ts` — 8 level definitions with name, event threshold, and effect description

## 3. Petdex API Client

- [x] 3.1 Create `src/petdex-api/client.ts` — fetch pet manifest from `https://petdex.crafter.run/api/manifest`, parse JSON, find pet by slug
- [x] 3.2 Implement pet asset download — download spritesheet and pet.json to `~/.petdex-cc/pets/<slug>/`

## 4. Hooks Bridge

- [x] 4.1 Create `src/hooks/bridge.sh` — Unix bridge script: read stdin JSON, POST to localhost HTTP server
- [x] 4.2 Create `src/hooks/bridge.ps1` — Windows PowerShell bridge script: same logic using Invoke-WebRequest
- [x] 4.3 Implement hooks registration — merge petdex-cc hooks into `~/.claude/settings.json` with backup
- [x] 4.4 Implement hooks removal — extract petdex-cc hooks from settings.json during uninstall

## 5. Electron Main Process

- [x] 5.1 Create `src/main/index.ts` — Electron app entry: create BrowserWindow, start HTTP server, create tray
- [x] 5.2 Create `src/main/server.ts` — HTTP server on port 17321 (fallback 17322-17330), POST /event endpoint, IPC bridge to renderer
- [x] 5.3 Create `src/main/tray.ts` — system tray icon with context menu (Show/Hide/Settings/Quit)
- [x] 5.4 Implement event-to-action mapping — parse hook_event_name + tool_name → pet action + bubble text

## 6. Electron Renderer — Pet Sprite

- [x] 6.1 Create `src/renderer/index.html` — base HTML with CSS for transparent background, sprite container, bubble container
- [x] 6.2 Create `src/renderer/pet-sprite.ts` — CSS spritesheet animation using background-position stepping, action switching via CSS custom properties
- [x] 6.3 Create `src/renderer/wander.ts` — full-screen random movement, edge bouncing, direction-based sprite row selection, speed control
- [x] 6.4 Create `src/renderer/drag.ts` — mouse drag interaction on pet sprite, pause wander during drag, resume after release
- [x] 6.5 Implement click-through — setIgnoreMouseEvents with hit-testing on sprite bounds, toggle on mouse enter/leave
- [x] 6.6 Create `src/renderer/context-menu.ts` — right-click menu with Switch Pet / Settings / About / Quit

## 7. Speech Bubbles

- [x] 7.1 Create `src/renderer/bubble.ts` — cartoon speech bubble component with triangle pointer, fade in/out animations, text truncation (60 chars)
- [x] 7.2 Implement bubble lifecycle — show for 3s (normal) or 8s (AI), new bubbles replace old, 200ms fade-in, 500ms fade-out
- [x] 7.3 Implement time-aware greetings — timer checks every 30min, greeting pools per time-of-day, only fires after 10min idle

## 8. Level System

- [x] 8.1 Create `src/main/storage.ts` — state.json read/write, HMAC signature generation/verification using machine-id, reset on tamper
- [x] 8.2 Implement event counting — increment totalEvents on each hook event, recalculate level, detect level-up
- [x] 8.3 Implement level-up celebration — special bubble message, jumping+waving animation sequence, AI speech trigger
- [ ] 8.4 Implement level visual effects — glow (L2), aura (L3), afterimage (L4), particles (L5), icon flash (L6), teleport flicker (L7), golden halo (L8)

## 9. AI Speech

- [x] 9.1 Create `src/main/ai-speech.ts` — API credential resolution chain (config.json → settings.json → fallback)
- [x] 9.2 Implement AI speech trigger logic — probability gates per event type, 2-minute cooldown tracking, level-up bypass
- [x] 9.3 Implement personality-aware prompt template — pet name + vibes + level + scene → prompt string
- [x] 9.4 Create preset fallback lines — pools per scene type (task_complete, error, idle, level_up)

## 10. CLI Commands

- [x] 10.1 Create `src/cli/install.ts` — `petdex-cc install <slug>`: check env, fetch pet, download assets, write hooks, start Electron
- [x] 10.2 Create `src/cli/start.ts` — `petdex-cc start`: check if running, spawn Electron in background
- [x] 10.3 Create `src/cli/stop.ts` — `petdex-cc stop`: find PID, send SIGTERM
- [x] 10.4 Create `src/cli/list.ts` — `petdex-cc list`: fetch manifest, display table, offline cache fallback
- [x] 10.5 Create `src/cli/switch.ts` — `petdex-cc switch <slug>`: download if needed, send IPC to running process
- [x] 10.6 Create `src/cli/status.ts` — `petdex-cc status`: read state.json, check process, display level info
- [x] 10.7 Create `src/cli/uninstall.ts` — `petdex-cc uninstall`: stop process, remove hooks, delete ~/.petdex-cc/
- [x] 10.8 Create `src/cli/config.ts` — `petdex-cc config`: read/write ~/.petdex-cc/config.json
- [x] 10.9 Create `bin/cli.ts` — entry point that routes subcommands to the appropriate module

## 11. Cross-Platform Polish

- [ ] 11.1 Test transparent window on Windows 10/11 — verify click-through, always-on-top, no taskbar icon
- [ ] 11.2 Test bridge.ps1 on Windows — hook shell:powershell configuration
- [ ] 11.3 Test transparent window on macOS — verify no Gatekeeper issues, correct Z-ordering
- [ ] 11.4 Test transparent window on Linux — verify X11 and Wayland compatibility
- [ ] 11.5 Implement auto-start registration — Windows (registry), Mac (LaunchAgent), Linux (XDG .desktop)

## 12. Build and Package

- [x] 12.1 Configure TypeScript build pipeline — compile to dist/, copy assets and hooks scripts
- [x] 12.2 Add npm `prepublishOnly` script to build before publish
- [ ] 12.3 Test full install flow end-to-end: `npx petdex-cc install boba` on a clean machine
- [x] 12.4 Write README.md with installation, usage, and configuration instructions
