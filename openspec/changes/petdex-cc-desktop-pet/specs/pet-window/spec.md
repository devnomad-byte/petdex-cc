## ADDED Requirements

### Requirement: Transparent always-on-top window
The system SHALL create an Electron BrowserWindow that is transparent, frameless, always on top, not resizable, not shown in taskbar, and has no shadow.

#### Scenario: Window appearance
- **WHEN** the pet window is created
- **THEN** the window is 300x320px, fully transparent (only the pet sprite and bubble are visible), always rendered above other windows, and does not appear in the taskbar

### Requirement: Click-through outside pet area
The window SHALL be click-through by default (`setIgnoreMouseEvents(true, { forward: true })`) so users can click through the transparent areas. When the mouse enters the pet sprite bounds (192x208), click-through SHALL be disabled to allow interaction.

#### Scenario: Click through transparent area
- **WHEN** user clicks on a transparent area of the pet window
- **THEN** the click passes through to the window below and the pet does not react

#### Scenario: Click on pet
- **WHEN** user clicks on the pet sprite area
- **THEN** the click is captured, click-through is disabled, and the pet plays a click animation (random: waving, jumping, or idle)

#### Scenario: Right-click on pet
- **WHEN** user right-clicks on the pet sprite area
- **THEN** a context menu appears with options: Switch Pet, Settings, About, Quit

### Requirement: Sprite animation via CSS
The renderer SHALL display pet sprites using CSS `background-position` animation on a div with the spritesheet as `background-image`. Action switching SHALL be done by changing CSS custom properties `--sprite-row`, `--sprite-frames`, and `--sprite-duration`.

#### Scenario: Display idle animation
- **WHEN** no event has been received for 3+ seconds
- **THEN** the pet displays the idle animation (row 0, 6 frames, 1100ms loop)

#### Scenario: Switch to running animation
- **WHEN** a PostToolUse Bash event arrives
- **THEN** the pet switches to the running animation (row 7, 6 frames, 820ms loop)

### Requirement: Auto-wander across screen
The pet SHALL move freely across the entire screen, choosing a new random direction every 5-12 seconds, bouncing off screen edges, and using `running-right`/`running-left` rows based on horizontal direction.

#### Scenario: Pet wanders right
- **WHEN** the pet chooses a rightward direction
- **THEN** the pet moves right at ~1px per frame using the running-right sprite row (row 1, 8 frames, 1060ms)

#### Scenario: Pet hits screen edge
- **WHEN** the pet reaches any screen edge
- **THEN** the direction component perpendicular to the edge is reversed and the pet continues

#### Scenario: Pet stops to idle
- **WHEN** the pet finishes a movement segment (5-12 seconds)
- **THEN** there is a 40% chance the pet stops and plays idle/waiting/waving for 2-4 seconds before choosing a new direction

### Requirement: Drag interaction
The user SHALL be able to drag the pet to any screen position by clicking and holding on the pet sprite.

#### Scenario: Drag pet
- **WHEN** user clicks and drags the pet sprite
- **THEN** the pet window follows the mouse cursor, wandering pauses, and the pet displays the idle animation during drag

#### Scenario: Release after drag
- **WHEN** user releases the mouse button after dragging
- **THEN** the pet stays at the new position and resumes wandering after 1 second

### Requirement: System tray integration
The Electron main process SHALL create a system tray icon with a context menu containing: Show Pet, Hide Pet, Settings, Quit.

#### Scenario: Hide pet via tray
- **WHEN** user clicks "Hide Pet" in the tray menu
- **THEN** the BrowserWindow is hidden but the HTTP server continues receiving events

#### Scenario: Show pet via tray
- **WHEN** user clicks "Show Pet" in the tray menu
- **THEN** the BrowserWindow becomes visible again at its last position
