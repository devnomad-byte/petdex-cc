/**
 * preinstall script: notify user that Electron is being downloaded
 */
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
};

// Skip during prepublishOnly
if (process.env.npm_lifecycle_event === "prepublishOnly") process.exit(0);

console.log("");
console.log(`  ${C.cyan}${C.bold}petdex-cc${C.reset} ${C.dim}Installing dependencies...${C.reset}`);
console.log(`  ${C.dim}⏳ Downloading Electron (~100MB), this may take a minute...${C.reset}`);
console.log(`  ${C.dim}   Tip: Set ELECTRON_MIRROR for faster downloads in China:${C.reset}`);
console.log(`  ${C.dim}   export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/${C.reset}`);
console.log("");
