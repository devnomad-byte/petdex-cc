import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stop } from "./stop.js";
import { start } from "./start.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getCurrentVersion(): string {
  const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8"));
  return pkg.version;
}

export function update(): void {
  const oldVersion = getCurrentVersion();

  console.log(`Current version: v${oldVersion}`);
  console.log("Updating...");

  stop();

  try {
    execSync("npm install -g petdex-cc@latest", { stdio: "inherit" });
  } catch {
    console.error("Update failed. Try manually: npm install -g petdex-cc@latest");
    process.exit(1);
  }

  console.log("Restarting pet...");
  start();

  console.log(`Updated! (was v${oldVersion})`);
}
