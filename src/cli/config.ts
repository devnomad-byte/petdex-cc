import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const CONFIG_PATH = join(homedir(), ".petdex-cc", "config.json");

export interface UserConfig {
  apiKey?: string;
  apiBaseUrl?: string;
  cooldownMinutes?: number;
}

export function loadConfig(): UserConfig {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    return {};
  }
}

export function saveConfig(config: UserConfig): void {
  const dir = join(homedir(), ".petdex-cc");
  mkdirSync(dir, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log("Configuration saved.");
}

export function config(args: string[]): void {
  const config = loadConfig();

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    switch (key) {
      case "--api-key":
        config.apiKey = value;
        break;
      case "--api-base-url":
        config.apiBaseUrl = value;
        break;
      case "--cooldown":
        config.cooldownMinutes = Number(value);
        break;
    }
  }

  saveConfig(config);
  console.log("Current config:", JSON.stringify(config, null, 2));
}
