import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { stop } from "./stop.js";
import { unregisterHooks } from "../hooks/register.js";

const PETDEX_DIR = join(homedir(), ".petdex-cc");

export function uninstall(): void {
  console.log("Stopping pet...");
  stop();

  console.log("Removing hooks...");
  unregisterHooks();

  console.log("Deleting ~/.petdex-cc/...");
  if (existsSync(PETDEX_DIR)) {
    rmSync(PETDEX_DIR, { recursive: true, force: true });
  }

  console.log("petdex-cc uninstalled.");
}
