import { join, dirname } from "node:path";
import { writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, ipcMain, Menu, dialog } from "electron";
// @ts-ignore - @electron/remote provides its own types
import electronRemote from "@electron/remote/main/index.js";
import { startServer, getActivePort, onEvent, onSwitch } from "./server.js";
import { createTray } from "./tray.js";
import { mapEventToAction } from "./event-mapper.js";
import { loadState, saveState, incrementEvents, detectLevelUp } from "./storage.js";
import { generateAiSpeech, getPresetLine, isAiOnCooldown } from "./ai-speech.js";

const PETDEX_DIR = join(homedir(), ".petdex-cc");
const DATA_DIR = join(PETDEX_DIR, "data");

let mainWindow: BrowserWindow | null = null;
let lastEventAt = Date.now();

const TIME_GREETINGS: Record<string, string[]> = {
  morning:   ["早上好！新的一天开始啦", "早安，今天也要加油哦"],
  lunch:     ["该吃午饭了，别饿着肚子写代码", "午饭时间！吃饭了吗？"],
  afternoon: ["下午好，喝杯水吧", "下午容易犯困，动动身体~"],
  evening:   ["下班啦，辛苦了！", "今天的工作完成了吗？"],
  night:     ["这么晚了，早点休息吧", "夜深了，注意身体哦"],
  midnight:  ["都凌晨了！真的不睡吗？", "熬夜写代码...精神可嘉"],
};

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return "morning";
  if (h >= 11 && h < 13) return "lunch";
  if (h >= 13 && h < 18) return "afternoon";
  if (h >= 18 && h < 23) return "evening";
  if (h >= 23 || h < 1) return "night";
  return "midnight";
}

function showTimeGreeting() {
  const idleMs = Date.now() - lastEventAt;
  if (idleMs < 10 * 60 * 1000) return;
  const tod = getTimeOfDay();
  const pool = TIME_GREETINGS[tod];
  if (!pool) return;
  const text = pool[Math.floor(Math.random() * pool.length)];
  mainWindow?.webContents.send("pet-action", {
    stateId: "waving",
    bubbleText: text,
    triggerAi: false,
  });
}

async function main() {
  await app.whenReady();
  electronRemote.initialize();

  const port = await startServer();
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(join(DATA_DIR, "port.lock"), String(port));

  mainWindow = new BrowserWindow({
    width: 300,
    height: 320,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
    },
  });

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const htmlPath = join(__dirname, "..", "renderer", "index.html");
  mainWindow.loadFile(htmlPath);
  electronRemote.enable(mainWindow.webContents);
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // When anything tries to go above the pet, immediately re-assert topmost
  mainWindow.on("blur", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(true, "screen-saver");
    }
  });

  createTray(mainWindow);

  const state = loadState();
  let currentState = state;

  onEvent(async (event) => {
    lastEventAt = Date.now();
    const action = mapEventToAction(event);

    const oldState = currentState;
    currentState = incrementEvents(currentState);
    const leveledUp = detectLevelUp(oldState, currentState);
    saveState(currentState);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("pet-action", action);

      if (leveledUp) {
        mainWindow.webContents.send("level-up", {
          level: currentState.level,
          levelName: currentState.levelName,
        });
      }

      if (action.triggerAi && action.aiScene) {
        let speech: string | null = null;
        if (!isAiOnCooldown() || leveledUp) {
          speech = await generateAiSpeech({
            petName: currentState.petSlug,
            vibes: [],
            levelName: currentState.levelName,
            scene: action.aiScene,
            skipCooldown: leveledUp,
          });
        }
        if (!speech) {
          speech = getPresetLine(action.aiScene);
        }
        mainWindow.webContents.send("ai-speech", { text: speech });
      }
    }
  });

  ipcMain.on("get-state", (event) => {
    event.reply("state", currentState);
  });

  ipcMain.on("get-window", (event) => {
    event.returnValue = mainWindow ? mainWindow.id : null;
  });

  ipcMain.on("show-context-menu", () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const menu = Menu.buildFromTemplate([
      {
        label: mainWindow.isVisible() ? "Hide Pet" : "Show Pet",
        click: () => mainWindow!.isVisible() ? mainWindow!.hide() : mainWindow!.show(),
      },
      { type: "separator" },
      {
        label: "About",
        click: async () => {
          dialog.showMessageBox({
            type: "info",
            title: "petdex-cc",
            message: "petdex-cc v0.1.0",
            detail: "Desktop pet companion for Claude Code.\nPets from https://petdex.crafter.run",
          });
        },
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => app.quit(),
      },
    ]);
    menu.popup({ window: mainWindow });
  });

  ipcMain.on("switch-pet", (_event, slug: string) => {
    currentState = { ...currentState, petSlug: slug };
    saveState(currentState);
    mainWindow?.webContents.send("pet-switched", slug);
  });

  onSwitch((slug: string) => {
    currentState = { ...currentState, petSlug: slug };
    saveState(currentState);
    mainWindow?.webContents.send("pet-switched", slug);
  });

  app.on("window-all-closed", () => {
    // Prevent app from quitting when pet window closes
  });

  setInterval(showTimeGreeting, 30 * 60 * 1000);
}

main().catch(console.error);
