import { spawn } from "node:child_process";
import { createRequire } from "node:module";

/**
 * postinstall script:
 * 1. Auto-detect if user is in China and set ELECTRON_MIRROR for faster downloads
 * 2. Ensure @electron/remote is installed (may be skipped during global install)
 */
const require = createRequire(import.meta.url);

const CHINA_MIRRORS = [
  "https://npmmirror.com/mirrors/electron/",
  "https://cdn.npmmirror.com/binaries/electron/",
];

async function main(): Promise<void> {
  // Skip during npm publish / prepublishOnly
  if (process.env.npm_lifecycle_event === "prepublishOnly") return;

  ensureElectronMirror();
  await ensureElectronRemote();
}

function ensureElectronMirror(): void {
  const existing = process.env.ELECTRON_MIRROR;
  if (existing) return; // User already configured

  // Simple heuristic: if npm registry is a China mirror, set electron mirror too
  const npmRegistry =
    process.env.npm_config_registry || "https://registry.npmjs.org";
  const isChina =
    npmRegistry.includes("npmmirror") ||
    npmRegistry.includes("taobao") ||
    npmRegistry.includes("tencent");

  if (isChina) {
    process.env.ELECTRON_MIRROR = CHINA_MIRRORS[0];
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
