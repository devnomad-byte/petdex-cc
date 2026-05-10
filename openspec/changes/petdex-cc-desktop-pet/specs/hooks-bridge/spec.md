## ADDED Requirements

### Requirement: HTTP server receives hook events
The Electron main process SHALL start an HTTP server on localhost port 17321 (trying up to port 17330 if occupied) that accepts POST requests at `/event` with JSON body containing the hook event data.

#### Scenario: Receive PostToolUse event
- **WHEN** Claude Code triggers a PostToolUse hook and bridge.sh posts the JSON to `http://localhost:17321/event`
- **THEN** the HTTP server parses the JSON, extracts `hook_event_name`, `tool_name`, and `tool_input`, and forwards the event to the renderer via Electron IPC

#### Scenario: Server not running
- **WHEN** bridge.sh executes but the Electron HTTP server is not running
- **THEN** curl fails silently (stderr redirected to /dev/null) and Claude Code continues normally

#### Scenario: Port conflict
- **WHEN** port 17321 is already in use by another application
- **THEN** the system tries ports 17322-17330 sequentially, writes the active port to `~/.petdex-cc/data/port.lock`, and bridge scripts read this file to determine the correct port

### Requirement: Bridge script forwards hook stdin to HTTP server
The system SHALL provide `bridge.sh` (Unix) and `bridge.ps1` (Windows) that read JSON from stdin and POST it to the local HTTP server asynchronously.

#### Scenario: Unix bridge script
- **WHEN** Claude Code fires a hook event on macOS/Linux
- **THEN** bridge.sh reads JSON from stdin, POSTs it to the HTTP server via curl in background (&), and exits immediately with code 0

#### Scenario: Windows bridge script
- **WHEN** Claude Code fires a hook event on Windows
- **THEN** bridge.ps1 reads JSON from stdin, POSTs it to the HTTP server via Invoke-WebRequest asynchronously, and exits immediately

### Requirement: All hooks are async and non-blocking
Every hook registered by petdex-cc SHALL use `async: true` so that Claude Code never waits for the pet to process an event.

#### Scenario: Hook execution timing
- **WHEN** Claude Code triggers a PostToolUse event
- **THEN** bridge.sh starts immediately, Claude Code continues without waiting, and the hook completes within the timeout (10 seconds)

### Requirement: Event type mapping
The HTTP server SHALL map incoming hook events to pet actions based on `hook_event_name` and `tool_name`.

#### Scenario: Map Read tool to review action
- **WHEN** a PostToolUse event arrives with `tool_name: "Read"`
- **THEN** the server sends IPC message with action "review" and bubble text "Reading {filename}..."

#### Scenario: Map Stop event to jumping action
- **WHEN** a Stop event arrives
- **THEN** the server sends IPC message with action "jumping" and bubble text "Task complete!" and triggers AI speech evaluation with 60% probability

#### Scenario: Map SessionStart to waving
- **WHEN** a SessionStart event arrives with `source: "startup"`
- **THEN** the server sends IPC message with action "waving" and bubble text "Let's get to work!"
