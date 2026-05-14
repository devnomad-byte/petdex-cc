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

const STATUSLINE_BRIDGE_SH = `#!/bin/bash
INPUT=$(cat)
PORT_FILE="$HOME/.petdex-cc/data/port.lock"
PORT=17321
if [ -f "$PORT_FILE" ]; then
  PORT=$(cat "$PORT_FILE" 2>/dev/null || echo "17321")
fi
TOTAL_IN=$(echo "$INPUT" | jq -r '.context_window.total_input_tokens // 0')
TOTAL_OUT=$(echo "$INPUT" | jq -r '.context_window.total_output_tokens // 0')
TOTAL=$((TOTAL_IN + TOTAL_OUT))
COST=$(echo "$INPUT" | jq -r '.cost.total_cost_usd // 0')
BODY="{\"total_tokens\":$TOTAL,\"cost_usd\":$COST}"
curl -s -X POST "http://localhost:$PORT/statusline" \\
  -H "Content-Type: application/json" \\
  -d "$BODY" > /dev/null 2>&1 &
`;

const STATUSLINE_BRIDGE_PS1 = `$inputJson = [System.Console]::In.ReadToEnd()
$portFile = Join-Path $env:USERPROFILE ".petdex-cc\\data\\port.lock"
$port = 17321
if (Test-Path $portFile) {
    $port = Get-Content $portFile -ErrorAction SilentlyContinue
    if (-not $port) { $port = 17321 }
}
$url = "http://localhost:$port/statusline"
try {
    $data = $inputJson | ConvertFrom-Json
    $totalIn = 0; $totalOut = 0; $cost = 0
    if ($data.context_window.total_input_tokens) { $totalIn = $data.context_window.total_input_tokens }
    if ($data.context_window.total_output_tokens) { $totalOut = $data.context_window.total_output_tokens }
    if ($data.cost.total_cost_usd) { $cost = $data.cost.total_cost_usd }
    $total = $totalIn + $totalOut
    $body = '{\\"total_tokens\\":' + $total + ',\\"cost_usd\\":' + $cost + '}'
    Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 5 | Out-Null
} catch {}
`;

export function writeBridgeScripts(): void {
  const hooksDir = path.join(homedir(), ".petdex-cc", "hooks");
  fs.mkdirSync(hooksDir, { recursive: true });

  fs.writeFileSync(path.join(hooksDir, "bridge.sh"), BRIDGE_SH, "utf-8");
  fs.writeFileSync(path.join(hooksDir, "bridge.ps1"), BRIDGE_PS1, "utf-8");
  fs.writeFileSync(path.join(hooksDir, "statusline-bridge.sh"), STATUSLINE_BRIDGE_SH, "utf-8");
  fs.writeFileSync(path.join(hooksDir, "statusline-bridge.ps1"), STATUSLINE_BRIDGE_PS1, "utf-8");

  if (process.platform !== "win32") {
    fs.chmodSync(path.join(hooksDir, "bridge.sh"), 0o755);
    fs.chmodSync(path.join(hooksDir, "statusline-bridge.sh"), 0o755);
  }
}
