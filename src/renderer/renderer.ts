import { setSpriteImage, setPetAction, getPetElement } from "./pet-sprite.js";
import { showBubble, showAiBubble, hideBubble } from "./bubble.js";
import { initClickThrough } from "./click-through.js";
import { initDrag } from "./drag.js";
import { ipcRenderer } from "electron";
import { getCurrentWindow, screen as remoteScreen } from "@electron/remote";

const WINDOW_W = 300;
const WINDOW_H = 320;
const MARGIN = 20;

const petEl = document.getElementById("pet-sprite") as HTMLElement;
const bubbleEl = document.getElementById("bubble") as HTMLElement;
const containerEl = document.getElementById("pet-container") as HTMLElement;

function getPetWindow(): Electron.BrowserWindow {
  return getCurrentWindow();
}

/** Position the pet in the bottom-right corner of the primary display. */
function positionBottomRight(): void {
  try {
    const display = remoteScreen.getPrimaryDisplay();
    const { x, y, width, height } = display.workArea;
    const win = getPetWindow();
    win.setPosition(
      x + width - WINDOW_W - MARGIN,
      y + height - WINDOW_H - MARGIN
    );
  } catch {
    // Fallback: use web screen API
    const win = getPetWindow();
    win.setPosition(
      window.screen.width - WINDOW_W - MARGIN,
      window.screen.height - WINDOW_H - MARGIN
    );
  }
}

function init() {
  if (!petEl) return;

  positionBottomRight();
  initClickThrough(getPetWindow(), petEl);
  initDrag(petEl, getPetWindow());
  setPetAction("idle");

  petEl.addEventListener("contextmenu", (e: MouseEvent) => {
    e.preventDefault();
    ipcRenderer.send("show-context-menu");
  });

  ipcRenderer.on("pet-action", (_event: Electron.IpcRendererEvent, action: { stateId: string; bubbleText: string }) => {
    if (action.stateId) setPetAction(action.stateId);
    if (action.bubbleText) showBubble(action.bubbleText);
  });

  ipcRenderer.on("ai-speech", (_event: Electron.IpcRendererEvent, data: { text: string }) => {
    if (data.text) showAiBubble(data.text);
  });

  ipcRenderer.on("level-up", (_event: Electron.IpcRendererEvent, data: { level: number; levelName: string }) => {
    showBubble(`Level up! ${data.levelName}!`);
    updateLevelEffects(data.level);
  });

  ipcRenderer.on("pet-switched", (_event: Electron.IpcRendererEvent, slug: string) => {
    loadPetSprite(slug);
  });

  ipcRenderer.on("state", (_event: Electron.IpcRendererEvent, state: { petSlug: string; level: number; levelName: string }) => {
    loadPetSprite(state.petSlug);
    updateLevelEffects(state.level);
  });

  ipcRenderer.send("get-state");
}

function loadPetSprite(slug: string) {
  if (!slug) return;
  const homeDir = (process.env.USERPROFILE || process.env.HOME || "").replace(/\\/g, "/");
  const exts = ["webp", "png"];
  for (const ext of exts) {
    const path = `file:///${homeDir}/.petdex-cc/pets/${slug}/spritesheet.${ext}`;
    setSpriteImage(path);
    break;
  }
}

const LEVEL_NAMES: Record<number, string> = {
  1: "Byte", 2: "Process", 3: "Thread", 4: "Module",
  5: "Kernel", 6: "Neural", 7: "Quantum", 8: "Singularity",
};

const LEVEL_COLORS: Record<number, string> = {
  1: "#94a3b8", 2: "#4ade80", 3: "#60a5fa", 4: "#a78bfa",
  5: "#f59e0b", 6: "#ec4899", 7: "#06b6d4", 8: "#fbbf24",
};

function updateLevelEffects(level: number) {
  document.documentElement.style.setProperty("--lv-color", LEVEL_COLORS[level] ?? "#94a3b8");

  const badge = document.getElementById("level-badge");
  if (badge) {
    badge.textContent = `Lv${level} ${LEVEL_NAMES[level] ?? ""}`;
    badge.style.display = level >= 2 ? "block" : "none";
  }

  const glow = document.getElementById("level-glow");
  if (glow) glow.classList.toggle("active", level >= 2);

  const aura = document.getElementById("level-aura");
  if (aura) aura.classList.toggle("active", level >= 3);

  document.querySelectorAll(".level-particle").forEach((p) => {
    (p as HTMLElement).classList.toggle("active", level >= 5);
  });

  const halo = document.getElementById("level-halo");
  if (halo) halo.classList.toggle("active", level >= 8);
}

init();
