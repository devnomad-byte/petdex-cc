## ADDED Requirements

### Requirement: Install command downloads pet and configures hooks
The system SHALL provide `npx petdex-cc install <slug>` that fetches the pet from Petdex API, downloads spritesheet and pet.json to `~/.petdex-cc/pets/<slug>/`, writes bridge scripts to `~/.petdex-cc/hooks/`, merges hook configuration into `~/.claude/settings.json` (creating a backup first), and starts the Electron pet window.

#### Scenario: Successful install of a known pet
- **WHEN** user runs `npx petdex-cc install boba`
- **THEN** system fetches boba's spritesheet and pet.json from Petdex CDN, stores them in `~/.petdex-cc/pets/boba/`, writes bridge.sh and bridge.ps1 to `~/.petdex-cc/hooks/`, merges hooks into `~/.claude/settings.json` without overwriting existing hooks, and launches the Electron pet window

#### Scenario: Pet slug not found
- **WHEN** user runs `npx petdex-cc install nonexistent-pet`
- **THEN** system SHALL display "Pet 'nonexistent-pet' not found" and exit with code 1 without modifying any files

#### Scenario: Claude Code not installed
- **WHEN** user runs install and `~/.claude/` directory does not exist
- **THEN** system SHALL display "Claude Code not detected. Install Claude Code first." and exit with code 1

### Requirement: List command shows available pets
The system SHALL provide `npx petdex-cc list` that fetches all approved pets from Petdex API `/api/manifest` and displays them as a table with slug, display name, and kind.

#### Scenario: Online list
- **WHEN** user runs `npx petdex-cc list` with network access
- **THEN** system displays a table of all approved pets from Petdex

#### Scenario: Offline fallback
- **WHEN** user runs `npx petdex-cc list` without network access
- **THEN** system displays cached pet list from last successful fetch, or "No pets cached. Connect to the internet."

### Requirement: Start and stop commands manage pet process
The system SHALL provide `npx petdex-cc start` to launch the Electron pet window and `npx petdex-cc stop` to terminate it.

#### Scenario: Start when not running
- **WHEN** user runs `npx petdex-cc start` and no petdex-cc process is running
- **THEN** system launches Electron in the background and displays "Pet started!"

#### Scenario: Start when already running
- **WHEN** user runs `npx petdex-cc start` and a petdex-cc process is already running
- **THEN** system displays "Pet is already running" and exits cleanly

#### Scenario: Stop running pet
- **WHEN** user runs `npx petdex-cc stop` and a petdex-cc process is running
- **THEN** system sends SIGTERM to the Electron process and displays "Pet stopped!"

### Requirement: Switch command changes active pet
The system SHALL provide `npx petdex-cc switch <slug>` that downloads the new pet (if not already cached) and tells the running Electron process to swap sprites. Hooks do not need reconfiguration.

#### Scenario: Switch to cached pet
- **WHEN** user runs `npx petdex-cc switch mochi` and mochi is already in `~/.petdex-cc/pets/`
- **THEN** system tells the running Electron process to load mochi's spritesheet without restarting

### Requirement: Status command shows pet state and level
The system SHALL provide `npx petdex-cc status` that displays the active pet name, current level, level name, total events, and running status.

#### Scenario: Status display
- **WHEN** user runs `npx petdex-cc status`
- **THEN** system displays pet name, level (e.g. "Level 3: Thread"), total events count, and whether the pet process is running

### Requirement: Uninstall command removes all traces
The system SHALL provide `npx petdex-cc uninstall` that stops the pet process, removes petdex-cc hooks from `~/.claude/settings.json`, and deletes `~/.petdex-cc/` directory.

#### Scenario: Full uninstall
- **WHEN** user runs `npx petdex-cc uninstall`
- **THEN** system stops the pet process, removes all petdex-cc hook entries from settings.json (preserving other hooks), deletes `~/.petdex-cc/` recursively, and displays "petdex-cc uninstalled"

### Requirement: Config command manages user settings
The system SHALL provide `npx petdex-cc config` for setting API key override, API base URL, and cooldown duration.

#### Scenario: Set API key
- **WHEN** user runs `npx petdex-cc config --api-key sk-xxx --api-base-url https://api.anthropic.com`
- **THEN** system writes the values to `~/.petdex-cc/config.json`

### Requirement: Hooks merge preserves existing configuration
The installer SHALL read `~/.claude/settings.json`, parse existing hooks, merge petdex-cc hooks into the appropriate event arrays, and write back. A backup SHALL be created at `~/.claude/settings.json.petdex-cc-backup` before writing.

#### Scenario: Merge with existing hooks
- **WHEN** settings.json already has a PostToolUse hook for Prettier
- **THEN** the installer adds petdex-cc's PostToolUse hook alongside the Prettier hook without removing it
