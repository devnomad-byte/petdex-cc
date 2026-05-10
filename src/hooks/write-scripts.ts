import * as fs from "fs";
import * as path from "path";
import { homedir } from "node:os";

const BRIDGE_SH = `#!/bin/bash
INPUT=$(cat)
PORT_FILE="$HOME/.petdex-cc/data/port.lock"
PORT=17321
if [ -f "$PORT_FILE" ]; then
  PORT=$(cat "$PORT_FILE" 2>/dev/null || echo "17321")
fi
curl -s -X POST "http://localhost:$PORT/event" \\
  -H "Content-Type: application/json" \\
  -d "$INPUT" > /dev/null 2>&1 &
`;

const BRIDGE_PS1 = `$inputJson = [System.Console]::In.ReadToEnd()
$portFile = Join-Path $env:USERPROFILE ".petdex-cc\\data\\port.lock"
$port = 17321
if (Test-Path $portFile) {
    $port = Get-Content $portFile -ErrorAction SilentlyContinue
    if (-not $port) { $port = 17321 }
}
$url = "http://localhost:$port/event"
try {
    Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json" -Body $inputJson -UseBasicParsing -TimeoutSec 5 | Out-Null
} catch {}
`;

export function writeBridgeScripts(): void {
  const hooksDir = path.join(homedir(), ".petdex-cc", "hooks");
  fs.mkdirSync(hooksDir, { recursive: true });

  const shPath = path.join(hooksDir, "bridge.sh");
  const ps1Path = path.join(hooksDir, "bridge.ps1");

  fs.writeFileSync(shPath, BRIDGE_SH, "utf-8");
  fs.writeFileSync(ps1Path, BRIDGE_PS1, "utf-8");

  // Make executable on unix
  if (process.platform !== "win32") {
    fs.chmodSync(shPath, 0o755);
  }
}
