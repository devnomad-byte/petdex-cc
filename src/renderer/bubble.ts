/**
 * Speech bubble module.
 *
 * Manages the cartoon speech bubble displayed above the pet. Only one bubble
 * is visible at a time; new bubbles immediately replace existing ones.
 */

const BUBBLE_ELEMENT_ID = "bubble";
const HIDDEN_CLASS = "bubble-hidden";
const DEFAULT_DURATION_MS = 3000;
const AI_DURATION_MS = 8000;
const FADE_MS = 200;

let bubbleTimer: ReturnType<typeof setTimeout> | null = null;

function getBubble(): HTMLElement | null {
  return document.getElementById(BUBBLE_ELEMENT_ID);
}

/**
 * Truncates text to `maxLen` characters, appending "..." when truncated.
 */
export function truncateText(text: string, maxLen: number = 60): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

/**
 * Immediately hides the speech bubble.
 */
export function hideBubble(): void {
  const el = getBubble();
  if (el) {
    el.classList.add(HIDDEN_CLASS);
  }
  if (bubbleTimer !== null) {
    clearTimeout(bubbleTimer);
    bubbleTimer = null;
  }
}

/**
 * Shows a speech bubble with the given text for the specified duration.
 *
 * A new bubble replaces any currently-visible bubble. The bubble fades in
 * over 200 ms and fades out after `durationMs`.
 *
 * @param text       Text to display (will be truncated to 60 chars).
 * @param durationMs How long to keep the bubble visible (default 3000 ms).
 */
export function showBubble(text: string, durationMs: number = DEFAULT_DURATION_MS): void {
  const el = getBubble();
  if (!el) return;

  // Cancel any existing timer so the new bubble takes over.
  if (bubbleTimer !== null) {
    clearTimeout(bubbleTimer);
    bubbleTimer = null;
  }

  el.textContent = truncateText(text);
  el.classList.remove(HIDDEN_CLASS);

  bubbleTimer = setTimeout(() => {
    el.classList.add(HIDDEN_CLASS);
    bubbleTimer = null;
  }, durationMs);
}

/**
 * Shows an AI-generated speech bubble. These last 8 seconds, longer than
 * regular event bubbles.
 */
export function showAiBubble(text: string): void {
  showBubble(text, AI_DURATION_MS);
}
