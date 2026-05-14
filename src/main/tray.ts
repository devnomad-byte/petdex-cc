import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { app, BrowserWindow, Menu, Tray, nativeImage } from "electron";

let tray: Tray | null = null;

function generateTrayIcon(): Electron.NativeImage {
  const S = 32;
  const buf = Buffer.alloc(S * S * 4);
  const cx = S / 2;
  const cy = S / 2;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const dx = x - cx + 0.5;
      const dy = y - cy + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Outer circle: cat face background
      const outerR = 14;
      if (dist <= outerR) {
        // Gradient: top-left lighter, bottom-right darker
        const t = (dx / outerR + dy / outerR) / 2;
        const r = Math.round(139 + (1 - t) * 40);
        const g = Math.round(92 + (1 - t) * 40);
        const b = Math.round(246);
        // Anti-aliased edge
        const edge = Math.max(0, Math.min(1, outerR - dist));
        const alpha = Math.round(edge * 255);
        // Highlight spot (upper-left)
        const hx = dx + 4, hy = dy + 4;
        const hDist = Math.sqrt(hx * hx + hy * hy);
        const highlight = Math.max(0, 1 - hDist / 8) * 0.25;

        buf[i]     = Math.min(255, Math.round(r + highlight * 80));
        buf[i + 1] = Math.min(255, Math.round(g + highlight * 80));
        buf[i + 2] = Math.min(255, Math.round(b + highlight * 40));
        buf[i + 3] = alpha;
      }

      // Cat ears (two triangles)
      const earPoints = [
        // Left ear
        [{ x: -9, y: -8 }, { x: -5, y: -15 }, { x: -2, y: -7 }],
        // Right ear
        [{ x: 2, y: -7 }, { x: 5, y: -15 }, { x: 9, y: -8 }],
      ];
      for (const ear of earPoints) {
        const [a, b2, c] = ear;
        const px = x - cx + 0.5, py = y - cy + 0.5;
        // Point-in-triangle test
        const d1 = (px - b2.x) * (a.y - b2.y) - (a.x - b2.x) * (py - b2.y);
        const d2 = (px - c.x) * (b2.y - c.y) - (b2.x - c.x) * (py - c.y);
        const d3 = (px - a.x) * (c.y - a.y) - (c.x - a.x) * (py - a.y);
        const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
        const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
        if (!(hasNeg && hasPos)) {
          // Inside ear — slightly darker purple
          buf[i]     = 0x7c;
          buf[i + 1] = 0x3a;
          buf[i + 2] = 0xed;
          buf[i + 3] = 0xff;
        }
      }

      // Eyes (two small white circles)
      const eyes = [{ x: -4.5, y: -1 }, { x: 4.5, y: -1 }];
      for (const eye of eyes) {
        const ed = Math.sqrt((dx - eye.x) ** 2 + (dy - eye.y) ** 2);
        if (ed <= 2.2) {
          const edge = Math.max(0, Math.min(1, 2.2 - ed));
          buf[i]     = 0xff;
          buf[i + 1] = 0xff;
          buf[i + 2] = 0xff;
          buf[i + 3] = Math.max(buf[i + 3], Math.round(edge * 255));
        }
        // Pupils
        const pd = Math.sqrt((dx - eye.x) ** 2 + (dy - eye.y + 0.3) ** 2);
        if (pd <= 1.2) {
          buf[i]     = 0x2d;
          buf[i + 1] = 0x1b;
          buf[i + 2] = 0x69;
          buf[i + 3] = 0xff;
        }
      }

      // Mouth (small curved line)
      const mouthY = 4;
      if (Math.abs(dy - mouthY) < 1.2 && Math.abs(dx) < 4) {
        const mouthCurve = (dx * dx) / 8;
        if (dy > mouthY + mouthCurve - 1.5 && dy < mouthY + mouthCurve + 0.5) {
          buf[i]     = 0x3b;
          buf[i + 1] = 0x1f;
          buf[i + 2] = 0x6e;
          buf[i + 3] = 0xff;
        }
      }
    }
  }

  return nativeImage.createFromBuffer(buf, { width: S, height: S });
}

export function createTray(mainWindow: BrowserWindow): Tray | null {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const iconPath = join(__dirname, "..", "assets", "tray-icon.png");

  let icon: Electron.NativeImage;
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) throw new Error("empty");
  } catch {
    icon = generateTrayIcon();
  }

  try {
    tray = new Tray(icon);
  } catch (err) {
    console.warn("Tray creation failed:", err);
    return null;
  }
  tray.setToolTip("petdex-cc");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Pet",
      click: () => {
        mainWindow.showInactive();
      },
    },
    {
      label: "Hide Pet",
      click: () => mainWindow.hide(),
    },
    { type: "separator" },
    {
      label: "About",
      click: async () => {
        const { dialog } = await import("electron");
        dialog.showMessageBox({
          type: "info",
          title: "petdex-cc",
          message: `petdex-cc v${JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "package.json"), "utf8")).version}`,
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

  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.showInactive();
    }
  });

  return tray;
}
