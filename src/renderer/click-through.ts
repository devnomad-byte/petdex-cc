/**
 * Click-through module.
 *
 * Makes the BrowserWindow click-through (transparent to mouse events) by
 * default, and disables click-through only when the cursor is over the pet
 * sprite area so the user can interact with the pet.
 */

import type { BrowserWindow } from "electron";

/**
 * Initialises click-through behaviour.
 *
 * - By default, `window.setIgnoreMouseEvents(true, { forward: true })` so
 *   clicks pass through transparent areas.
 * - When the mouse enters the pet element bounds, click-through is disabled.
 * - When the mouse leaves the pet element bounds, click-through is re-enabled.
 *
 * @param win    The Electron BrowserWindow.
 * @param petEl  The pet sprite DOM element used for hit-testing.
 */
export function initClickThrough(
  win: BrowserWindow,
  petEl: HTMLElement,
): void {
  // Default: click-through enabled.
  win.setIgnoreMouseEvents(true, { forward: true });

  petEl.addEventListener("mouseenter", () => {
    win.setIgnoreMouseEvents(false);
  });

  petEl.addEventListener("mouseleave", () => {
    win.setIgnoreMouseEvents(true, { forward: true });
  });
}
