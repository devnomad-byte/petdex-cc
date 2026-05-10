import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

interface AiConfig {
  apiKey?: string;
  apiBaseUrl?: string;
}

interface ClaudeSettings {
  env?: Record<string, string>;
}

let lastAiCallAt = 0;
const COOLDOWN_MS = 2 * 60 * 1000;

export function isAiOnCooldown(): boolean {
  return Date.now() - lastAiCallAt < COOLDOWN_MS;
}

export function resetCooldown(): void {
  lastAiCallAt = Date.now();
}

export function resolveCredentials(): { apiKey: string; baseUrl: string } | null {
  const config = loadConfig();
  if (config.apiKey && config.apiBaseUrl) {
    return { apiKey: config.apiKey, baseUrl: config.apiBaseUrl };
  }

  const claudeSettings = loadClaudeSettings();
  if (claudeSettings.env?.ANTHROPIC_AUTH_TOKEN && claudeSettings.env?.ANTHROPIC_BASE_URL) {
    return {
      apiKey: claudeSettings.env.ANTHROPIC_AUTH_TOKEN,
      baseUrl: claudeSettings.env.ANTHROPIC_BASE_URL,
    };
  }

  return null;
}

function loadConfig(): AiConfig {
  const configPath = join(homedir(), ".petdex-cc", "config.json");
  if (!existsSync(configPath)) return {};
  try {
    return JSON.parse(readFileSync(configPath, "utf8")) as AiConfig;
  } catch {
    return {};
  }
}

function loadClaudeSettings(): ClaudeSettings {
  const settingsPath = join(homedir(), ".claude", "settings.json");
  if (!existsSync(settingsPath)) return {};
  try {
    return JSON.parse(readFileSync(settingsPath, "utf8")) as ClaudeSettings;
  } catch {
    return {};
  }
}

export function buildPrompt(args: {
  petName: string;
  vibes: string[];
  levelName: string;
  scene: string;
}): string {
  const vibeStr = args.vibes.length > 0 ? args.vibes.join(", ") : "friendly";
  return [
    `You are ${args.petName}, a ${vibeStr} desktop pet陪伴程序员写代码.`,
    `当前等级: ${args.levelName}.`,
    `场景: ${args.scene}`,
    `请用一句话（15字以内）回应这个场景。语气要${vibeStr}。`,
    `不要用markdown，不要加引号，只输出纯文字。`,
  ].join("\n");
}

export async function generateAiSpeech(args: {
  petName: string;
  vibes: string[];
  levelName: string;
  scene: string;
  skipCooldown?: boolean;
}): Promise<string | null> {
  if (!args.skipCooldown && isAiOnCooldown()) return null;

  const creds = resolveCredentials();
  if (!creds) return null;

  resetCooldown();

  try {
    const prompt = buildPrompt(args);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${creds.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": creds.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 100,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    const text = data.content?.[0]?.text?.trim();
    if (text && text.length <= 60) return text;
    return text ? text.slice(0, 57) + "..." : null;
  } catch {
    return null;
  }
}

export const PRESET_LINES: Record<string, string[]> = {
  task_complete: [
    "做得好！",
    "又搞定一个！",
    "太棒了，继续加油！",
    "完美！",
    "漂亮！",
    "干得漂亮！",
    "搞定！",
  ],
  error: [
    "别担心，bugs难免的~",
    "每个错误都是学习机会",
    "别灰心，再试一次！",
    "加油，你能搞定的！",
    "深呼吸，慢慢来~",
  ],
  idle: [
    "还在吗？",
    "我有点无聊了...",
    "主人去哪了？",
    "等你回来~",
    "打个盹先...",
  ],
  level_up: [
    "升级啦！太厉害了！",
    "哇，你又变强了！",
    "新等级get！",
    "进化了！",
  ],
};

export function getPresetLine(scene: string): string {
  const pool = PRESET_LINES[scene] ?? PRESET_LINES.task_complete;
  return pool[Math.floor(Math.random() * pool.length)];
}
