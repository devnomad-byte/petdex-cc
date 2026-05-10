import { readFileSync, existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const PID_FILE = join(homedir(), ".petdex-cc", "data", "pid.lock");

export function stop(): void {
  if (!existsSync(PID_FILE)) {
    console.log("Pet is not running.");
    return;
  }

  try {
    const pid = Number.parseInt(readFileSync(PID_FILE, "utf8").trim(), 10);

    // Try graceful shutdown via HTTP first
    const portFile = join(homedir(), ".petdex-cc", "data", "port.lock");
    let port = 17321;
    try {
      port = Number(readFileSync(portFile, "utf8").trim()) || 17321;
    } catch {}

    try {
      const { fetch } = globalThis;
      fetch(`http://localhost:${port}/shutdown`, { method: "POST" }).catch(() => {});
    } catch {
      // Fallback to SIGTERM
      process.kill(pid, "SIGTERM");
    }

    console.log("Pet stopped!");
  } catch {
    console.log("Pet process not found (may have already stopped).");
  } finally {
    try {
      unlinkSync(PID_FILE);
    } catch {}
  }
}
