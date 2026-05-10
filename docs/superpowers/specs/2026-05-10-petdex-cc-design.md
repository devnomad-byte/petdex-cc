# petdex-cc: Desktop Pet Companion for Claude Code

## Overview

petdex-cc is a desktop pet companion application that lives on your screen while you use Claude Code. It pulls animated pets from the Petdex gallery (https://petdex.crafter.run), reacts in real-time to Claude Code's activity via hooks, and evolves based on your usage.

One command to install: `npx petdex-cc install boba`

## Architecture

### Technology Stack

- **Language**: TypeScript throughout
- **Desktop framework**: Electron (transparent, frameless, always-on-top BrowserWindow)
- **Communication**: Claude Code hooks (async command) → curl POST → Electron HTTP server
- **Pet assets**: Petdex public API (/api/manifest), spritesheet format reused as-is
- **AI speech**: Reuses API credentials from `~/.claude/settings.json`

### Three Processes

```
Claude Code
  └─ hooks (async: true, does not block)
      └─ PostToolUse / Stop / Notification / ...
          ↓ curl POST http://localhost:17321/event

petdex-cc Daemon (Electron)
  ┌─ Main Process ─────────────────────────┐
  │  HTTP Server (port 17321)               │
  │  System Tray                            │
  │  Level system / Data persistence        │
  │  AI speech scheduler (2min cooldown)    │
  └─────────────────────────────────────────┘

  ┌─ Renderer Process (BrowserWindow) ──────┐
  │  Transparent, frameless, always-on-top   │
  │  Pet sprite animation (CSS spritesheet)  │
  │  Bubble component (fade in/out)          │
  │  Auto-wander + drag + click              │
  └─────────────────────────────────────────┘
```

### Data Flow

1. Claude Code event fires → hook receives JSON on stdin → `curl` POSTs to local HTTP server
2. HTTP server parses event type → sends via Electron IPC to renderer
3. Renderer selects the corresponding pet action row + shows bubble text
4. On key moments (task done / error / level up) → main process reads API key from `~/.claude/settings.json` → calls AI → result sent to renderer as bubble

### Project Structure

```
D:\petdex-project\petdex-cc\
├── package.json
├── src/
│   ├── main/
│   │   ├── index.ts          # Entry: start HTTP server + create window
│   │   ├── server.ts         # HTTP server (receives hook events)
│   │   ├── tray.ts           # System tray
│   │   ├── storage.ts        # Level data persistence (encrypted)
│   │   └── ai-speech.ts      # AI speech scheduler + cooldown
│   ├── renderer/
│   │   ├── index.html
│   │   ├── pet-sprite.ts     # Sprite animation (reuses Petdex CSS logic)
│   │   ├── bubble.ts         # Bubble component
│   │   ├── wander.ts         # Auto-wander logic
│   │   ├── drag.ts           # Drag logic
│   │   └── context-menu.ts   # Right-click menu
│   ├── hooks/
│   │   ├── bridge.sh         # Unix: read stdin JSON → curl POST
│   │   └── bridge.ps1        # Windows: same in PowerShell
│   ├── cli/
│   │   ├── install.ts        # petdex-cc install <name>
│   │   ├── start.ts          # petdex-cc start
│   │   ├── stop.ts           # petdex-cc stop
│   │   ├── list.ts           # petdex-cc list
│   │   ├── switch.ts         # petdex-cc switch <slug>
│   │   ├── status.ts         # petdex-cc status
│   │   ├── uninstall.ts      # petdex-cc uninstall
│   │   └── config.ts         # petdex-cc config
│   ├── shared/
│   │   ├── events.ts         # Event type definitions
│   │   ├── pet-states.ts     # Pet action states (from Petdex)
│   │   └── levels.ts         # Level evolution definitions
│   └── petdex-api/
│       └── client.ts         # Petdex API client
├── assets/
│   └── default-sprites/      # Built-in default pet (offline fallback)
└── dist/
```

## Hook Event Mapping

### Events to Pet Actions

| Claude Code Hook | Matcher | Pet Action | Bubble Content | AI Speech? |
|---|---|---|---|---|
| `SessionStart` | `startup` | waving | "Let's get to work!" | No |
| `PostToolUse` | `Read` | review | "Reading {filename}..." | No |
| `PostToolUse` | `Edit\|Write` | idle | "Edited {filename}" | No |
| `PostToolUse` | `Bash` | running | "Running command..." | No |
| `PostToolUse` | `Glob\|Grep` | waiting | "Searching..." | No |
| `PostToolUseFailure` | `*` | failed | "Oops, something went wrong" | Optional |
| `Stop` | (none) | jumping | "Task complete!" | Yes (60%) |
| `StopFailure` | `*` | failed | "Encountered an error..." | Yes (40%) |
| `Notification` | `idle_prompt` | waiting | AI-generated | Yes (idle >5min) |
| `TaskCompleted` | (none) | jumping + running | "Task done!" | Yes (100%) |
| `SessionEnd` | (none) | waving | "See you next time!" | No |
| `PostToolBatch` | (none) | idle | (batch summary, low priority) | No |
| Timer (meal times) | — | waving | "Have you eaten?" | No |

### Hook Registration

All hooks use `async: true` to avoid blocking Claude. A single bridge script handles all events; the `hook_event_name` field in the JSON distinguishes event types.

Written to `~/.claude/settings.json` under the `hooks` key. The installer merges with existing hooks rather than overwriting.

### Bridge Script

```bash
#!/bin/bash
INPUT=$(cat)
curl -s -X POST http://localhost:17321/event \
  -H "Content-Type: application/json" \
  -d "$INPUT" > /dev/null 2>&1 &
```

If Electron is not running, curl fails silently — Claude Code is not affected.

## Pet UI Rendering

### Sprite Animation

Reuses Petdex's CSS spritesheet approach exactly:

- Single spritesheet image: 1536 x 1872px (8 columns x 9 rows)
- Each frame: 192 x 208px (displayed at original size, no scaling)
- CSS `@keyframes` with `background-position` stepping and `steps()` timing function
- CSS custom properties (`--sprite-row`, `--sprite-frames`, `--sprite-duration`) control which action plays

### Window Configuration

```typescript
new BrowserWindow({
  width: 300,
  height: 320,
  transparent: true,
  frame: false,
  alwaysOnTop: true,
  resizable: false,
  skipTaskbar: true,
  hasShadow: false,
  setIgnoreMouseEvents(true, { forward: true }),
});
```

**Click-through behavior**:
- Default: entire window is click-through (mouse events pass to windows below)
- When mouse enters the pet sprite area → `setIgnoreMouseEvents(false)` → interactive (drag/click/right-click)
- When mouse leaves → resume click-through

### Auto-Wander

- Full-screen free movement (any direction: up, down, left, right)
- Speed: ~1px per 16ms frame (~60fps)
- New random direction every 5-12 seconds
- Bounces off screen edges (reverse direction)
- Uses `running-right` sprite row when moving right, `running-left` when moving left
- When stopped, randomly picks idle / waiting / waving
- Dragging pauses wandering; resumes on release

### Bubble Component

Cartoon-style speech bubble:

- Rounded white card with small triangle pointer toward pet
- Semi-transparent background: `rgba(255,255,255,0.9)`
- Max width: 220px, text wraps if too long
- Fade in: 200ms, Fade out: 500ms
- Normal events: 3 seconds, AI speech: 8 seconds
- New bubbles replace old ones (no stacking)

### Time-Aware Greetings

```typescript
const greetings = {
  morning:   ["Good morning! New day, new code!", "Rise and shine!"],
  lunch:     ["Lunch time! Don't code on an empty stomach", "Have you eaten?"],
  afternoon: ["Afternoon! Drink some water", "Stay active, stretch a bit~"],
  evening:   ["Great work today!", "Are you done for the day?"],
  night:     ["It's late, get some rest", "Take care of yourself!"],
  midnight:  ["Midnight coding... respect!", "You really should sleep..."],
};
```

Timer checks every 30 minutes. Only triggers if no event in the last 10 minutes.

## Level System

### Levels

| Level | Name | Events Required | Visual Effect |
|---|---|---|---|
| 1 | Byte | 0 | None |
| 2 | Process | 50 | Slight glow |
| 3 | Thread | 200 | Small aura under feet |
| 4 | Module | 500 | Afterimage trail while walking |
| 5 | Kernel | 1000 | Periodic particle effect |
| 6 | Neural | 2000 | Icon flashing above head |
| 7 | Quantum | 5000 | Semi-transparent teleport flicker |
| 8 | Singularity | 10000 | All effects stacked + golden halo |

"Events" = cumulative count of all hook events received (Read, Edit, Bash, Stop, etc.)

### Data Storage

`~/.petdex-cc/data/state.json`:

```json
{
  "petSlug": "boba",
  "totalEvents": 342,
  "level": 3,
  "levelName": "Thread",
  "createdAt": "2026-05-10T10:00:00Z",
  "lastActiveAt": "2026-05-10T16:33:00Z",
  "version": 1
}
```

### Anti-Cheat

- HMAC signature stored in `~/.petdex-cc/data/state.sig`
- Key derived from machine ID (`machine-id` package)
- On read: verify signature, reset to level 1 if mismatch

## AI Speech

### Trigger Conditions

- `Stop` event (task complete) → 60% probability
- `TaskCompleted` event → 100%
- `StopFailure` event → 40% (comforting message)
- Idle >5 minutes (timer) → 100%
- Level up → 100% (special congratulations)

Cooldown: 2 minutes minimum between AI calls.

### API Credential Resolution

1. `~/.petdex-cc/config.json` → `apiKey` + `apiBaseUrl` (user override)
2. `~/.claude/settings.json` → `env.ANTHROPIC_AUTH_TOKEN` + `env.ANTHROPIC_BASE_URL`
3. Neither available → fall back to preset lines, no error

### AI Request

- Model: user's configured model, default haiku (cost-saving)
- Timeout: 5 seconds, fallback to preset line on failure
- Prompt template includes pet name, personality (from vibes), level, and current scene

## Installation Flow

```bash
$ npx petdex-cc install boba
```

Steps:
1. Check environment (Node >=18, Claude Code installed)
2. Fetch pet from Petdex API (GET /api/manifest, find matching slug)
3. Download spritesheet + pet.json to `~/.petdex-cc/pets/boba/`
4. Configure Claude Code hooks (merge into `~/.claude/settings.json`, backup first)
5. Write bridge script to `~/.petdex-cc/hooks/`
6. Start Electron pet window (background)
7. Optional: register auto-start on login

## CLI Commands

```
npx petdex-cc install <slug>    # Install pet + configure hooks + start
npx petdex-cc start              # Start pet (when already installed)
npx petdex-cc stop               # Stop pet
npx petdex-cc list               # List available pets (from Petdex API)
npx petdex-cc switch <slug>      # Switch pet (no hook reconfiguration)
npx petdex-cc status             # Show current pet status and level
npx petdex-cc uninstall          # Remove hooks + stop + cleanup
npx petdex-cc config             # Configure API key / cooldown / etc.
```

## User Machine Directory Layout

```
~/.petdex-cc/
├── hooks/
│   ├── bridge.sh
│   └── bridge.ps1
├── pets/
│   └── boba/
│       ├── spritesheet.webp
│       └── pet.json
├── data/
│   ├── state.json
│   └── state.sig
└── config.json
```

## Cross-Platform Notes

- `.claude` directory: `~/.claude/` on all platforms (Windows: `C:\Users\<user>\.claude\`, Mac: `/Users/<user>/.claude/`, Linux: `/home/<user>/.claude/`)
- Bridge script: `.sh` on Mac/Linux, `.ps1` on Windows. Hook config uses `"shell": "powershell"` on Windows.
- Electron transparent window behavior is consistent across Win10/11, macOS, and Linux.
- Auto-start: Windows (registry), Mac (LaunchAgent), Linux (XDG autostart .desktop file).
