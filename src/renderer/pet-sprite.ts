/**
 * Pet sprite renderer module.
 *
 * Manages the CSS custom properties that drive the sprite sheet animation
 * on the #pet-sprite element. The states array is embedded inline because
 * this runs in the Electron renderer context which may not have module
 * resolution for the shared types package.
 */

interface PetState {
  id: string;
  label: string;
  row: number;
  frames: number;
  durationMs: number;
}

const petStates: PetState[] = [
  { id: "idle", label: "Idle", row: 0, frames: 6, durationMs: 1100 },
  { id: "running-right", label: "Running Right", row: 1, frames: 8, durationMs: 1060 },
  { id: "running-left", label: "Running Left", row: 2, frames: 8, durationMs: 1060 },
  { id: "waving", label: "Waving", row: 3, frames: 4, durationMs: 700 },
  { id: "jumping", label: "Jumping", row: 4, frames: 5, durationMs: 840 },
  { id: "failed", label: "Failed", row: 5, frames: 8, durationMs: 1220 },
  { id: "waiting", label: "Waiting", row: 6, frames: 6, durationMs: 1010 },
  { id: "running", label: "Running", row: 7, frames: 6, durationMs: 820 },
  { id: "review", label: "Review", row: 8, frames: 6, durationMs: 1030 },
];

/**
 * Sets the sprite sheet URL on the pet element via the --sprite-url CSS variable.
 */
export function setSpriteImage(url: string): void {
  const el = getPetElement();
  if (el) {
    el.style.setProperty("--sprite-url", `url("${url}")`);
  }
}

/**
 * Switches the pet animation to the state identified by `stateId`.
 * Updates --sprite-row, --sprite-frames, and --sprite-duration.
 *
 * Restarts the animation by removing/re-adding the animation name so
 * the browser replays it from frame 0.
 */
export function setPetAction(stateId: string): void {
  const el = getPetElement();
  if (!el) return;

  const state = petStates.find((s) => s.id === stateId);
  if (!state) return;

  el.style.setProperty("--sprite-row", String(state.row));
  el.style.setProperty("--sprite-frames", String(state.frames));
  el.style.setProperty("--sprite-duration", `${state.durationMs}ms`);

  // Restart the animation so it picks up the new custom properties from frame 0.
  const currentAnimation = el.style.animation;
  el.style.animation = "none";
  // Force reflow so the browser acknowledges the "none" value.
  void el.offsetWidth;
  el.style.animation = currentAnimation || "";
}

/**
 * Returns the #pet-sprite HTMLElement, or null if not found.
 */
export function getPetElement(): HTMLElement | null {
  return document.getElementById("pet-sprite");
}
