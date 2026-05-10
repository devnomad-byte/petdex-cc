## ADDED Requirements

### Requirement: AI speech triggers on key moments
The system SHALL trigger AI speech generation on: Stop event (60% probability), TaskCompleted (100%), StopFailure (40%), idle >5 minutes (100%), and level up (100%).

#### Scenario: Task completion triggers AI speech
- **WHEN** a Stop event arrives and a random check passes (60% chance) and the 2-minute cooldown has elapsed
- **THEN** the system calls the AI API with a personality-aware prompt and displays the result as a bubble

#### Scenario: Cooldown prevents rapid AI calls
- **WHEN** a TaskCompleted event arrives less than 2 minutes after the last AI speech
- **THEN** the system skips AI speech and uses a preset line instead

### Requirement: API credential resolution chain
The system SHALL resolve AI API credentials in order: (1) `~/.petdex-cc/config.json` apiKey + apiBaseUrl, (2) `~/.claude/settings.json` env.ANTHROPIC_AUTH_TOKEN + ANTHROPIC_BASE_URL, (3) neither available → preset lines with no error.

#### Scenario: Use Claude Code credentials
- **WHEN** `~/.petdex-cc/config.json` has no apiKey but `~/.claude/settings.json` has `ANTHROPIC_AUTH_TOKEN: "sk-xxx"` and `ANTHROPIC_BASE_URL: "https://api.anthropic.com"`
- **THEN** the system uses sk-xxx and https://api.anthropic.com for the AI request

#### Scenario: No credentials available
- **WHEN** neither config file contains API credentials
- **THEN** the system selects a preset line matching the scene and displays it without making any API call

### Requirement: AI request uses personality-aware prompt
The AI prompt SHALL include the pet's display name, personality (from vibes field), current level name, and current scene context. The response SHALL be limited to 15 characters of plain text.

#### Scenario: Generate playful speech on task completion
- **WHEN** pet "boba" with vibes ["playful", "cheerful"] at level "Thread" completes a task
- **THEN** the system sends a prompt like "You are boba, a playful and cheerful desktop pet. Level: Thread. Scene: task completed. Respond in one short sentence (15 chars max). No markdown, no quotes."

#### Scenario: AI request timeout
- **WHEN** the AI API does not respond within 5 seconds
- **THEN** the system cancels the request and displays a preset line matching the scene

### Requirement: Preset fallback lines
The system SHALL maintain a pool of preset lines per scene type (task_complete, error, idle, level_up) for use when AI is unavailable or on cooldown.

#### Scenario: Fallback on error scene
- **WHEN** a StopFailure event arrives but AI is on cooldown
- **THEN** the system randomly selects from preset error lines like "Don't worry, bugs happen!" or "Every error is a learning opportunity~"
