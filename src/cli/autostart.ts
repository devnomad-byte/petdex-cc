import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const AutoLaunch = require("auto-launch");

const __dirname = dirname(fileURLToPath(import.meta.url));

const pkgRoot = join(__dirname, "..", "..", "..");
const cliEntry = join(pkgRoot, "dist", "bin", "cli.js");

function getAutoLauncher() {
  return new AutoLaunch({
    name: "petdex-cc",
    path: process.execPath,
    isHidden: true,
    extraArgs: [cliEntry, "start"],
  });
}

export async function enableAutostart(): Promise<void> {
  const launcher = getAutoLauncher();
  const alreadyEnabled = await launcher.isEnabled();
  if (alreadyEnabled) return;
  await launcher.enable();
}

export async function disableAutostart(): Promise<void> {
  const launcher = getAutoLauncher();
  const alreadyEnabled = await launcher.isEnabled();
  if (!alreadyEnabled) return;
  await launcher.disable();
}

export async function autostartStatus(): Promise<boolean> {
  const launcher = getAutoLauncher();
  return launcher.isEnabled();
}

export async function autostart(subcommand?: string): Promise<void> {
  switch (subcommand) {
    case "--enable":
    case "enable":
      await enableAutostart();
      console.log("Auto-start enabled. petdex-cc will launch on login.");
      break;
    case "--disable":
    case "disable":
      await disableAutostart();
      console.log("Auto-start disabled.");
      break;
    default: {
      const enabled = await autostartStatus();
      console.log(`Auto-start: ${enabled ? "enabled" : "disabled"}`);
      break;
    }
  }
}
