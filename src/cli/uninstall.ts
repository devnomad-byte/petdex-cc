import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { stop } from "./stop.js";
import { unregisterHooks } from "../hooks/register.js";
import { disableAutostart } from "./autostart.js";

const PETDEX_DIR = join(homedir(), ".petdex-cc");

export async function uninstall(): Promise<void> {
  console.log("Stopping pet...");
  stop();

  console.log("Removing hooks...");
  unregisterHooks();

  console.log("Disabling auto-start...");
  try { await disableAutostart(); } catch {}

  console.log("Deleting ~/.petdex-cc/...");
  if (existsSync(PETDEX_DIR)) {
    rmSync(PETDEX_DIR, { recursive: true, force: true });
  }

  console.log("petdex-cc uninstalled.");
}
