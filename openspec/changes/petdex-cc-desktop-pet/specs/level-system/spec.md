## ADDED Requirements

### Requirement: Eight-level progression based on event count
The system SHALL track cumulative hook events and assign one of 8 levels: Byte (0), Process (50), Thread (200), Module (500), Kernel (1000), Neural (2000), Quantum (5000), Singularity (10000).

#### Scenario: Initial level
- **WHEN** petdex-cc is first installed and no events have been recorded
- **THEN** the pet is at Level 1: Byte with no visual effects

#### Scenario: Level up from events
- **WHEN** the 50th hook event is received
- **THEN** the pet advances to Level 2: Process and gains a slight glow effect

#### Scenario: Multiple level ups at once
- **WHEN** the pet is at Level 1 and event 200 is received
- **THEN** the pet advances directly to Level 3: Thread (skipping Level 2 display)

### Requirement: Visual effects per level
Each level above 1 SHALL add a visual effect to the pet: glow (2), aura (3), afterimage (4), particles (5), icon flash (6), teleport flicker (7), golden halo + all effects (8).

#### Scenario: Level 5 particle effect
- **WHEN** the pet is at Level 5: Kernel
- **THEN** small particle sprites periodically emit from the pet's position

#### Scenario: Level 8 maximum effect
- **WHEN** the pet is at Level 8: Singularity
- **THEN** the pet has all effects active simultaneously plus a distinctive golden halo around the sprite

### Requirement: Encrypted state persistence
State SHALL be persisted to `~/.petdex-cc/data/state.json` with an HMAC signature in `~/.petdex-cc/data/state.sig`. The HMAC key SHALL be derived from the machine's unique ID.

#### Scenario: State saved after event
- **WHEN** a hook event is processed and the event count increments
- **THEN** state.json is updated with the new totalEvents count and current level, and state.sig is regenerated

#### Scenario: Signature verification on load
- **WHEN** the Electron app starts and reads state.json
- **THEN** the system verifies the HMAC signature; if invalid, the state is reset to Level 1: Byte with 0 events

### Requirement: Level-up notification
When the pet advances to a new level, the system SHALL display a special bubble message, trigger AI speech (100% probability, bypasses cooldown), and play a celebration animation (jumping followed by waving).

#### Scenario: Level up celebration
- **WHEN** the pet advances from Level 2 to Level 3
- **THEN** the pet plays the jumping animation for 2 seconds, then waving for 1 second, and a bubble shows "Level up! You're now Thread!" followed by an AI-generated congratulations message

### Requirement: Event count displayed in status
The `npx petdex-cc status` command and tray menu tooltip SHALL show the current level name, level number, and total events.

#### Scenario: Status shows level info
- **WHEN** user runs `npx petdex-cc status`
- **THEN** output shows "Pet: boba | Level 3: Thread | Events: 342 | Running: yes"
