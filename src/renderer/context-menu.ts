/**
 * Context menu module.
 *
 * Builds the right-click context menu for the pet. Electron Menu is
 * available via the preload bridge in the renderer process.
 */

import { Menu, app, BrowserWindow } from "electron";

/**
 * Creates the pet context menu.
 *
 * Menu items:
 *  - "Show Pet" / "Hide Pet" toggle
 *  - Separator
 *  - "Switch Pet..."
 *  - "Settings..."
 *  - "About"
 *  - Separator
 *  - "Quit"
 *
 * @param win The BrowserWindow this menu controls.
 * @returns An Electron Menu instance.
 */
export function createContextMenu(win: BrowserWindow): Electron.Menu {
  return Menu.buildFromTemplate([
    {
      label: win.isVisible() ? "Hide Pet" : "Show Pet",
      click: () => {
        if (win.isVisible()) {
          win.hide();
        } else {
          win.show();
        }
      },
    },
    { type: "separator" },
    {
      label: "Switch Pet...",
      click: () => {
        // Placeholder -- will be implemented in a future iteration.
        const { dialog } = require("electron") as typeof Electron;
        dialog.showMessageBox(win, {
          type: "info",
          title: "Switch Pet",
          message: "Pet switching is not yet implemented.",
          detail: "Use: npx petdex-cc install <pet-name> to switch pets.",
        });
      },
    },
    {
      label: "Settings...",
      click: () => {
        const { dialog } = require("electron") as typeof Electron;
        dialog.showMessageBox(win, {
          type: "info",
          title: "Settings",
          message: "Settings are not yet implemented.",
          detail: "Configuration will be available in a future version.",
        });
      },
    },
    {
      label: "About",
      click: () => {
        const { dialog } = require("electron") as typeof Electron;
        dialog.showMessageBox(win, {
          type: "info",
          title: "petdex-cc",
          message: "petdex-cc",
          detail:
            "Desktop pet companion for Claude Code.\nPets from https://petdex.crafter.run",
        });
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);
}
