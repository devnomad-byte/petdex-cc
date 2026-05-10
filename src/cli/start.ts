import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const PID_FILE = join(homedir(), ".petdex-cc", "data", "pid.lock");

export function start(): void {
  if (isRunning()) {
    console.log("Pet is already running.");
    return;
  }

  const electronPath = require("electron");
  const mainPath = join(import.meta.dirname, "..", "main", "index.js");
  const child = spawn(String(electronPath), [mainPath], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  const dir = join(homedir(), ".petdex-cc", "data");
  mkdirSync(dir, { recursive: true });
  writeFileSync(PID_FILE, String(child.pid));

  console.log("Pet started!");
}

export function isRunning(): boolean {
  if (!existsSync(PID_FILE)) return false;
  try {
    const pid = Number.parseInt(readFileSync(PID_FILE, "utf8").trim(), 10);
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
