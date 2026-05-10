<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-8b5cf6?style=flat-square" />
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-0ea5e9?style=flat-square" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-22c55e?style=flat-square" />
  <img src="https://img.shields.io/badge/license-MIT-f59e0b?style=flat-square" />
  <img src="https://img.shields.io/badge/pets-1569%20available-ec4899?style=flat-square" />
</p>

<h1 align="center">
  <br />
  <code>petdex-cc</code>
  <br />
  <sub><b>Desktop Pet Companion for Claude Code</b></sub>
  <br />
  <sub><i>Animated pets that react to your coding in real-time</i></sub>
</h1>

<p align="center">
  <a href="./README_CN.md">中文文档</a>
</p>

---

<br />

> Pick a companion from [**petdex.crafter.run**](https://petdex.crafter.run/) — 1,569 pets to choose from.
> Install with one command. Watch your pet come alive as you code.

<br />

## What It Does

Your desktop pet lives in a transparent, always-on-top window and **reacts to your Claude Code activity in real-time**:

| What happens in Claude Code | What your pet does |
|---|---|
| You read a file | Pet reviews the code with you |
| You edit or write a file | Pet watches your changes |
| You run a shell command | Pet runs alongside you |
| A task completes | Pet celebrates with a happy jump |
| An error occurs | Pet shows concern and encouragement |
| You go idle | Pet waves and sends time-appropriate greetings |
| You level up | Pet glows, sparkles, and celebrates |

<br />

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed (`~/.claude/` exists)

### Install a Pet

```bash
# Browse pets → https://petdex.crafter.run/
# Pick one, then install it with the slug:

npx petdex-cc install boba
```

That's it. Your pet appears on your desktop immediately.

> **Popular pets:** `boba` (otter) · `doraemon` · `noir-webling` (spider detective) · `ikun-hoops` (basketball chick)

<br />

## CLI Commands

```
petdex-cc install <slug>   Install a pet and configure hooks
petdex-cc start            Start the desktop pet
petdex-cc stop             Stop the desktop pet
petdex-cc list             Browse available pets from Petdex
petdex-cc switch <slug>    Switch to a different pet
petdex-cc status           Show current pet status & level
petdex-cc uninstall        Remove hooks and pet data
petdex-cc config           Configure API key and settings
```

<br />

## Level System

Your pet grows as you code. Every Claude Code action counts as an event.

| Level | Name | Events Needed | Visual Effect |
|:---:|---|---:|---|
| 1 | **Byte** | 0 | Base pet |
| 2 | **Process** | 50 | Soft breathing glow |
| 3 | **Thread** | 200 | Rotating aura ring |
| 4 | **Module** | 500 | Stronger effects |
| 5 | **Kernel** | 1,000 | Floating light particles |
| 6 | **Neural** | 2,000 | Pink particle storm |
| 7 | **Quantum** | 5,000 | Cyan energy field |
| 8 | **Singularity** | 10,000 | Golden halo + all effects |

<br />

## AI Speech

When you have an Anthropic API key configured (via `petdex-cc config` or Claude Code settings), your pet generates **context-aware speech bubbles**:

- Task completed → AI-generated encouragement
- Error occurred → Comforting words
- Idle for too long → Time-appropriate greetings
- Level up → Celebration message

No API key? Built-in preset lines work great too.

<br />

## Developer Setup

```bash
# Clone the repo
git clone https://github.com/devnomad-byte/petdex-cc.git
cd petdex-cc

# Install dependencies
npm install

# Build
npm run build

# Start the pet (development)
npx electron .

# Or install globally for CLI access
npm link
petdex-cc install boba
```

### Project Structure

```
petdex-cc/
├── bin/cli.ts              CLI entry point
├── src/
│   ├── main/               Electron main process
│   │   ├── index.ts        Window & event loop
│   │   ├── server.ts       HTTP event receiver (hooks → pet)
│   │   ├── ai-speech.ts    AI speech generation
│   │   ├── storage.ts      State persistence with HMAC signing
│   │   ├── tray.ts         System tray menu
│   │   └── event-mapper.ts Hook events → pet actions
│   ├── renderer/           Electron renderer (pet UI)
│   │   ├── index.html      Transparent window HTML/CSS
│   │   ├── renderer.ts     Main renderer logic
│   │   ├── pet-sprite.ts   Spritesheet animation engine
│   │   ├── bubble.ts       Speech bubble system
│   │   ├── click-through.ts Click transparency
│   │   └── drag.ts         Draggable pet
│   ├── cli/                CLI commands
│   ├── hooks/              Claude Code hooks registration
│   └── petdex-api/         Petdex API client & download
```

### Build Commands

| Command | What it does |
|---|---|
| `npm run build` | TypeScript compile + bundle renderer |
| `npm run check` | Type-check without emitting |
| `npx electron .` | Start pet from compiled output |

<br />

## How It Works

```
Claude Code ──hooks──▶ ~/.claude/settings.json
                            │
                            ▼
                    bridge.ps1 / bridge.sh
                            │
                            ▼
                    HTTP POST /event (localhost)
                            │
                            ▼
                    ┌───────────────┐
                    │   petdex-cc   │
                    │  (Electron)   │
                    │               │
                    │  event-mapper │──▶ pet action + speech bubble
                    │  storage      │──▶ level up detection
                    │  ai-speech    │──▶ AI-generated responses
                    └───────────────┘
                            │
                            ▼
                    Desktop pet window
```

<br />

## Configuration

### API Key (optional, for AI speech)

```bash
# Set via config command
petdex-cc config --api-key <your-key> --api-base-url <url>

# Or it auto-detects from Claude Code settings (~/.claude/settings.json)
```

### Hook Events

petdex-cc registers these Claude Code hooks automatically:

| Hook Event | Trigger |
|---|---|
| `PostToolUse` | After Read, Edit, Write, Bash, Glob, Grep |
| `PostToolUseFailure` | After any tool fails |
| `Stop` | Claude finishes responding |
| `StopFailure` | Claude stops with an error |
| `Notification` | Idle notification |
| `SessionStart` | Claude Code starts or resumes |
| `SessionEnd` | Claude Code session ends |
| `TaskCompleted` | A task is marked complete |

<br />

## Find Your Pet

Visit [**petdex.crafter.run**](https://petdex.crafter.run/) to browse all 1,569+ community pets. Each pet has a unique slug you use to install:

```bash
# Find a pet you like, copy its slug, then:
petdex-cc install <slug>
```

<br />

## License

MIT — see [LICENSE](./LICENSE) for details.

<br />

---

<p align="center">
  <sub>Built with love for the Claude Code community</sub><br />
  <sub>Pets powered by <a href="https://petdex.crafter.run/">Petdex</a></sub>
</p>
