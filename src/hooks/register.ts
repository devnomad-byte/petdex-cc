import * as fs from "fs";
import * as path from "path";
import { homedir } from "node:os";

const CLAUDE_SETTINGS = path.join(homedir(), ".claude", "settings.json");
const PETDEX_CC_HOOK_MARKER = "petdex-cc-bridge";

interface HookHandler {
  type: "command";
  command: string;
  async?: boolean;
  timeout?: number;
  shell?: string;
}

interface MatcherGroup {
  matcher?: string;
  hooks: HookHandler[];
}

type HooksMap = Record<string, MatcherGroup[]>;

interface ClaudeSettings {
  hooks?: HooksMap;
  statusLine?: { type: string; command: string };
  [key: string]: unknown;
}

function isWindows(): boolean {
  return process.platform === "win32";
}

function getBridgeScriptPath(): string {
  const home = homedir();
  if (isWindows()) {
    return path.join(home, ".petdex-cc", "hooks", "bridge.ps1");
  }
  return path.join(home, ".petdex-cc", "hooks", "bridge.sh");
}

function buildMatcherGroup(matcher?: string): MatcherGroup {
  const bridgePath = getBridgeScriptPath();
  const handler: HookHandler = {
    type: "command",
    command: `${bridgePath} # ${PETDEX_CC_HOOK_MARKER}`,
    async: true,
    timeout: 10,
  };
  if (isWindows()) {
    handler.shell = "powershell";
  }
  const group: MatcherGroup = {
    hooks: [handler],
  };
  if (matcher) {
    group.matcher = matcher;
  }
  return group;
}

export function registerHooks(): void {
  let settings: ClaudeSettings = {};

  if (fs.existsSync(CLAUDE_SETTINGS)) {
    const raw = fs.readFileSync(CLAUDE_SETTINGS, "utf-8");
    try {
      settings = JSON.parse(raw);
    } catch {
      settings = {};
    }
  }

  // Create backup
  if (fs.existsSync(CLAUDE_SETTINGS)) {
    const backupPath = CLAUDE_SETTINGS + ".petdex-cc-backup";
    fs.copyFileSync(CLAUDE_SETTINGS, backupPath);
  }

  // Ensure hooks object exists
  if (!settings.hooks) {
    settings.hooks = {};
  }

  // Define all hooks to register
  const hookDefinitions: Array<{ event: string; matcher?: string }> = [
    { event: "PostToolUse", matcher: "Read|Edit|Write|Bash|Glob|Grep" },
    { event: "PostToolUseFailure" },
    { event: "Stop" },
    { event: "StopFailure" },
    { event: "Notification", matcher: "idle_prompt" },
    { event: "SessionStart", matcher: "startup|resume" },
    { event: "SessionEnd" },
    { event: "TaskCompleted" },
  ];

  for (const def of hookDefinitions) {
    const newGroup = buildMatcherGroup(def.matcher);

    if (!settings.hooks[def.event]) {
      settings.hooks[def.event] = [];
    }

    // Remove any existing petdex-cc matcher groups for this event
    settings.hooks[def.event] = settings.hooks[def.event].filter(
      (group) => {
        const handlers = group.hooks ?? [];
        return !handlers.some((h) => (h.command ?? "").includes(PETDEX_CC_HOOK_MARKER));
      }
    );

    // Add the new matcher group
    settings.hooks[def.event].push(newGroup);
  }

  fs.writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2), "utf-8");

  // Register statusLine
  registerStatusLine(settings);
}

function getStatusLineScriptPath(): string {
  const home = homedir();
  if (isWindows()) {
    return path.join(home, ".petdex-cc", "hooks", "statusline-bridge.ps1");
  }
  return path.join(home, ".petdex-cc", "hooks", "statusline-bridge.sh");
}

const STATUSLINE_MARKER = "petdex-cc-statusline";

function registerStatusLine(settings: ClaudeSettings): void {
  const scriptPath = getStatusLineScriptPath();
  settings.statusLine = {
    type: "command",
    command: `${scriptPath} # ${STATUSLINE_MARKER}`,
  };
  fs.writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2), "utf-8");
}

export function unregisterHooks(): void {
  if (!fs.existsSync(CLAUDE_SETTINGS)) {
    return;
  }

  const raw = fs.readFileSync(CLAUDE_SETTINGS, "utf-8");
  let settings: ClaudeSettings;
  try {
    settings = JSON.parse(raw);
  } catch {
    return;
  }

  if (!settings.hooks) {
    return;
  }

  for (const event of Object.keys(settings.hooks)) {
    // Handle both nested format (MatcherGroup[]) and legacy flat format
    settings.hooks[event] = (settings.hooks[event] as MatcherGroup[]).filter(
      (group: MatcherGroup) => {
        const handlers = group.hooks ?? [];
        return !handlers.some((h) => (h.command ?? "").includes(PETDEX_CC_HOOK_MARKER));
      }
    );

    // Clean up empty arrays
    if (settings.hooks[event].length === 0) {
      delete settings.hooks[event];
    }
  }

  // Clean up empty hooks object
  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  // Remove statusLine if it was registered by us
  if (settings.statusLine?.command?.includes(STATUSLINE_MARKER)) {
    delete settings.statusLine;
  }

  fs.writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2), "utf-8");
}
