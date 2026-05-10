import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { findPetBySlug } from "../petdex-api/client.js";
import { downloadPetAssets } from "../petdex-api/download.js";
import { registerHooks } from "../hooks/register.js";
import { writeBridgeScripts } from "../hooks/write-scripts.js";
import { spawn } from "node:child_process";
import { getDefaultState, saveState } from "../main/storage.js";
import { stop } from "./stop.js";

const CLAUDE_DIR = join(homedir(), ".claude");

export async function install(slug: string): Promise<void> {
  if (!existsSync(CLAUDE_DIR)) {
    console.error("Claude Code not detected. Install Claude Code first.");
    process.exit(1);
  }

  console.log(`Looking up pet "${slug}" on Petdex...`);
  const pet = await findPetBySlug(slug);
  if (!pet) {
    console.error(`Pet "${slug}" not found on Petdex.`);
    process.exit(1);
  }

  console.log(`Found: ${pet.displayName} (${pet.kind})`);
  console.log("Downloading assets...");
  const paths = await downloadPetAssets(pet);
  console.log(`  Spritesheet: ${paths.spritesheetPath}`);
  console.log(`  Pet JSON: ${paths.petJsonPath}`);

  console.log("Writing bridge scripts...");
  writeBridgeScripts();

  console.log("Configuring Claude Code hooks...");
  registerHooks();
  console.log("  Hooks registered in ~/.claude/settings.json");

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

  console.log("Starting pet...");
  await startElectron();

  console.log(`\n✓ petdex-cc installed! "${pet.displayName}" is now on your desktop.`);
}

async function startElectron(): Promise<void> {
  const require = createRequire(import.meta.url);
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const electronPath = require("electron");
  const child = spawn(String(electronPath), [join(__dirname, "..", "main", "index.js")], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}
