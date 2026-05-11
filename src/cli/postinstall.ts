import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

/**
 * postinstall script:
 * 1. Print download complete message
 * 2. Auto-detect if user is in China and persist ELECTRON_MIRROR to ~/.npmrc
 * 3. Ensure @electron/remote is installed (may be skipped during global install)
 */
const require = createRequire(import.meta.url);

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
};

const ELECTRON_MIRROR_URL = "https://npmmirror.com/mirrors/electron/";

async function main(): Promise<void> {
  // Skip during npm publish / prepublishOnly
  if (process.env.npm_lifecycle_event === "prepublishOnly") return;

  // Print download complete message
  console.log(`  ${C.green}✔${C.reset} ${C.dim}Dependencies installed successfully!${C.reset}`);
  console.log("");

  ensureElectronMirror();
  await ensureElectronRemote();
}

/**
 * Auto-detect China npm registry and persist ELECTRON_MIRROR to ~/.npmrc.
 * This only runs once — if electron_mirror is already in .npmrc, it's skipped.
 */
function ensureElectronMirror(): void {
  // Already set in env (user did it manually), don't override
  if (process.env.ELECTRON_MIRROR) return;

  // Check if npm registry is a China mirror
  const npmRegistry =
    process.env.npm_config_registry || "https://registry.npmjs.org";
  const isChina =
    npmRegistry.includes("npmmirror") ||
    npmRegistry.includes("taobao") ||
    npmRegistry.includes("tencent");

  if (!isChina) return;

  // Set for current process
  process.env.ELECTRON_MIRROR = ELECTRON_MIRROR_URL;

  // Persist to ~/.npmrc so future installs also benefit
  const npmrcPath = join(homedir(), ".npmrc");
  let npmrc = "";
  if (existsSync(npmrcPath)) {
    npmrc = readFileSync(npmrcPath, "utf8");
  }

  // Only add if not already present
  if (!npmrc.includes("electron_mirror")) {
    const line = `electron_mirror=${ELECTRON_MIRROR_URL}\n`;
    npmrc = npmrc.trimEnd() + "\n" + line;
    writeFileSync(npmrcPath, npmrc);
  }
}

async function ensureElectronRemote(): Promise<void> {
  try {
    require.resolve("@electron/remote/main/index.js");
    return; // Already installed
  } catch {
    // Not found — install it
    const registry =
      process.env.npm_config_registry || "https://registry.npmjs.org";

    await new Promise<void>((resolve, reject) => {
      const args = ["install", "@electron/remote", "--registry", registry];
      const child = spawn("npm", args, {
        cwd: process.cwd(),
        stdio: "ignore",
        shell: true,
      });
      child.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`npm install @electron/remote failed (exit ${code})`));
      });
    }).catch(() => {
      // Non-fatal: the start command has its own fallback
    });
  }
}

main().catch(() => {
  // Silently fail — don't block npm install
});
