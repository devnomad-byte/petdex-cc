import { createHmac, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import machineId from "node-machine-id";
const { machineIdSync } = machineId;

const DATA_DIR = join(homedir(), ".petdex-cc", "data");
const STATE_FILE = join(DATA_DIR, "state.json");
const SIG_FILE = join(DATA_DIR, "state.sig");

export interface PersistedState {
  petSlug: string;
  totalEvents: number;
  level: number;
  levelName: string;
  createdAt: string;
  lastActiveAt: string;
  version: number;
}

function getHmacKey(): string {
  return `petdex-cc-${machineIdSync()}`;
}

function signState(state: PersistedState): string {
  const key = getHmacKey();
  return createHmac("sha256", key).update(JSON.stringify(state)).digest("hex");
}

function verifySignature(state: PersistedState, sig: string): boolean {
  const expected = signState(state);
  if (expected.length !== sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

export function getDefaultState(slug: string = ""): PersistedState {
  return {
    petSlug: slug,
    totalEvents: 0,
    level: 1,
    levelName: "Byte",
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    version: 1,
  };
}

export function loadState(): PersistedState {
  if (!existsSync(STATE_FILE) || !existsSync(SIG_FILE)) {
    return getDefaultState();
  }

  try {
    const raw = readFileSync(STATE_FILE, "utf8");
    const sig = readFileSync(SIG_FILE, "utf8").trim();
    const state = JSON.parse(raw) as PersistedState;

    if (!verifySignature(state, sig)) {
      return getDefaultState(state.petSlug);
    }

    return state;
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: PersistedState): void {
  mkdirSync(DATA_DIR, { recursive: true });
  const sig = signState(state);
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  writeFileSync(SIG_FILE, sig);
}

export function incrementEvents(state: PersistedState, count: number = 1): PersistedState {
  const updated = {
    ...state,
    totalEvents: state.totalEvents + count,
    lastActiveAt: new Date().toISOString(),
  };

  const levels = [
    { level: 1, name: "Byte", threshold: 0 },
    { level: 2, name: "Process", threshold: 50 },
    { level: 3, name: "Thread", threshold: 200 },
    { level: 4, name: "Module", threshold: 500 },
    { level: 5, name: "Kernel", threshold: 1000 },
    { level: 6, name: "Neural", threshold: 2000 },
    { level: 7, name: "Quantum", threshold: 5000 },
    { level: 8, name: "Singularity", threshold: 10000 },
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (updated.totalEvents >= levels[i].threshold) {
      updated.level = levels[i].level;
      updated.levelName = levels[i].name;
      break;
    }
  }

  return updated;
}

export function detectLevelUp(oldState: PersistedState, newState: PersistedState): boolean {
  return newState.level > oldState.level;
}
