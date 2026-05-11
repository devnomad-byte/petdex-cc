import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { findPetBySlug } from "../petdex-api/client.js";
import { downloadPetAssets } from "../petdex-api/download.js";
import { registerHooks } from "../hooks/register.js";
import { writeBridgeScripts } from "../hooks/write-scripts.js";
import { spawn, execSync } from "node:child_process";
import { getDefaultState, saveState } from "../main/storage.js";
import { stop } from "./stop.js";

// ANSI escape codes
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

const SPINNER_FRAMES = ["⣾","⣽","⣻","⢿","⡿","⣟","⣯","⣷"];
let spinnerTimer: ReturnType<typeof setInterval> | null = null;

function startSpinner(msg: string): void {
  let i = 0;
  process.stdout.write(`  ${C.dim}${SPINNER_FRAMES[0]} ${msg}${C.reset}`);
  spinnerTimer = setInterval(() => {
    i = (i + 1) % SPINNER_FRAMES.length;
    process.stdout.write(`\r  ${C.dim}${SPINNER_FRAMES[i]} ${msg}${C.reset}`);
  }, 70);
}

function stopSpinner(msg: string): void {
  if (spinnerTimer) { clearInterval(spinnerTimer); spinnerTimer = null; }
  process.stdout.write(`\r  ${C.green}✔${C.reset} ${msg}\n`);
}

function step(label: string): void {
  process.stdout.write(`  ${C.dim}⟳${C.reset} ${label}...`);
}

function stepDone(label: string): void {
  process.stdout.write(`\r  ${C.green}✔${C.reset} ${label}      \n`);
}

const CLAUDE_DIR = join(homedir(), ".claude");

export async function install(slug: string): Promise<void> {
  if (!existsSync(CLAUDE_DIR)) {
    console.error(`\n  ${C.red}✖${C.reset} Claude Code not detected. Install Claude Code first.\n`);
    process.exit(1);
  }

  // Header
  console.log("");
  console.log(`  ${C.magenta}${C.bold}petdex-cc${C.reset} ${C.dim}v0.1.0${C.reset}`);
  console.log(`  ${C.dim}─────────────────────────────${C.reset}`);

  // Step 1: Lookup
  step("Searching Petdex");
  const pet = await findPetBySlug(slug);
  if (!pet) {
    process.stdout.write(`\r  ${C.red}✖${C.reset} Pet "${C.bold}${slug}${C.reset}" not found on Petdex.\n\n`);
    process.exit(1);
  }
  stepDone(`Found ${C.cyan}${C.bold}${pet.displayName}${C.reset} ${C.dim}(${pet.kind})${C.reset}`);

  // Step 2: Download with progress bar
  const progressBar = (info: { phase: string; bytesDone: number; bytesTotal: number }): void => {
    const pct = info.bytesTotal > 0 ? Math.min(100, Math.round((info.bytesDone / info.bytesTotal) * 100)) : 0;
    const filled = Math.round(pct / 3.33);
    const empty = 30 - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    const mb = (info.bytesDone / 1024 / 1024).toFixed(1);
    const totalMb = info.bytesTotal > 0 ? (info.bytesTotal / 1024 / 1024).toFixed(1) : "?";
    process.stdout.write(`\r  ${C.dim}⣟${C.reset} ${C.cyan}${info.phase}${C.reset} ${C.dim}[${bar}]${C.reset} ${C.bold}${pct}%${C.reset} ${C.dim}${mb}/${totalMb}MB${C.reset}`);
  };

  const paths = await downloadPetAssets(pet, progressBar);
  stopSpinner(`${C.cyan}${pet.displayName}${C.reset} assets downloaded`);

  // Step 3: Bridge scripts
  step("Writing bridge scripts");
  writeBridgeScripts();
  stepDone("Bridge scripts ready");

  // Step 4: Hooks
  step("Registering Claude Code hooks");
  registerHooks();
  stepDone("Hooks configured");

  // Step 5: Init state
  saveState(getDefaultState(slug));

  // Kill any existing pet process
  stop();
  try {
    const { execSync } = await import("node:child_process");
    if (process.platform === "win32") {
      execSync("taskkill /F /IM electron.exe 2>nul", { stdio: "ignore" });
    } else {
      execSync("pkill -f 'electron.*petdex-cc' 2>/dev/null || true", { stdio: "ignore" });
    }
  } catch {}

  // Step 6: Start
  step(`Launching ${pet.displayName}`);
  await startElectron();
  stepDone(`${C.cyan}${pet.displayName}${C.reset} is now on your desktop`);

  // Final output
  console.log("");
  console.log(`  ${C.green}✨ Installed!${C.reset} ${C.bold}${pet.displayName}${C.reset} is ready to go.`);
  console.log(`  ${C.dim}Your pet will react to Claude Code in real-time.${C.reset}`);
  console.log("");
}

async function startElectron(): Promise<void> {
  const require = createRequire(import.meta.url);
  const __dirname = dirname(fileURLToPath(import.meta.url));

  // Ensure @electron/remote is available (may be missing after global install)
  try {
    require.resolve("@electron/remote/main/index.js");
  } catch {
    const pkgRoot = dirname(require.resolve("petdex-cc/package.json"));
    execSync("npm install @electron/remote", {
      cwd: pkgRoot,
      stdio: "ignore",
    });
  }

  const electronPath = require("electron");
  const child = spawn(String(electronPath), [join(__dirname, "..", "main", "index.js")], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}
