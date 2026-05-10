## ADDED Requirements

### Requirement: Cartoon speech bubble above pet
The system SHALL display a cartoon-style speech bubble above the pet sprite. The bubble SHALL have a rounded white semi-transparent card (`rgba(255,255,255,0.9)`) with a small triangular pointer toward the pet.

#### Scenario: Bubble appears on event
- **WHEN** a PostToolUse Read event arrives with `tool_input.file_path: "/src/auth.ts"`
- **THEN** a bubble appears above the pet showing "Reading auth.ts..." (filename only, no path) with a fade-in of 200ms

#### Scenario: Bubble disappears after timeout
- **WHEN** a normal event bubble has been visible for 3 seconds
- **THEN** the bubble fades out over 500ms and is removed from the DOM

#### Scenario: AI speech bubble lasts longer
- **WHEN** an AI-generated speech bubble appears
- **THEN** the bubble remains visible for 8 seconds before fading out

### Requirement: Bubble text truncation
Bubble text SHALL be limited to 60 characters. Longer text SHALL be truncated with ellipsis. The bubble max width SHALL be 220px with text wrapping.

#### Scenario: Long bubble text
- **WHEN** an event produces bubble text longer than 60 characters
- **THEN** the text is truncated to 57 characters plus "..." and displayed in the bubble

### Requirement: New bubbles replace old ones
Only one bubble SHALL be visible at a time. A new bubble SHALL immediately replace any existing bubble without stacking.

#### Scenario: Rapid events
- **WHEN** three PostToolUse events arrive within 1 second
- **THEN** only the last event's bubble text is displayed; the first two are replaced

### Requirement: Time-aware greetings
The system SHALL display time-appropriate greeting bubbles based on the hour of day, but only when the pet has been idle (no hook events) for at least 10 minutes. The check SHALL run every 30 minutes.

#### Scenario: Lunch greeting
- **WHEN** it is between 11:00 and 13:00 local time AND no hook events have occurred in the last 10 minutes
- **THEN** the pet displays a greeting bubble like "Lunch time! Have you eaten?" randomly chosen from the lunch greeting pool

#### Scenario: Late night greeting
- **WHEN** it is between 23:00 and 06:00 local time AND no hook events have occurred in the last 10 minutes
- **THEN** the pet displays a greeting bubble like "It's late, get some rest!" randomly chosen from the night greeting pool

#### Scenario: No greeting during active use
- **WHEN** the last hook event was less than 10 minutes ago
- **THEN** no time-aware greeting is shown, even if the 30-minute timer fires
