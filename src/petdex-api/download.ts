import fs from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
import type { PetManifestEntry } from "./client.js";

const PETDEX_DIR = path.join(homedir(), ".petdex-cc");

export function getPetDir(slug: string): string {
  return path.join(PETDEX_DIR, "pets", slug);
}

function resolveExtension(url: string): string {
  const pathname = new URL(url).pathname;
  if (pathname.endsWith(".png")) return ".png";
  return ".webp";
}

export type ProgressCallback = (info: {
  phase: string;
  bytesDone: number;
  bytesTotal: number;
}) => void;

async function downloadWithProgress(
  url: string,
  destPath: string,
  phase: string,
  onProgress?: ProgressCallback,
): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const total = parseInt(response.headers.get("content-length") || "0", 10);
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const chunks: Uint8Array[] = [];
  let done = 0;

  for (;;) {
    const { value, done: ended } = await reader.read();
    if (ended) break;
    chunks.push(value);
    done += value.length;
    if (onProgress) onProgress({ phase, bytesDone: done, bytesTotal: total || done });
  }

  const buffer = Buffer.concat(chunks);
  fs.writeFileSync(destPath, buffer);
}

export async function downloadPetAssets(
  pet: PetManifestEntry,
  onProgress?: ProgressCallback,
): Promise<{ spritesheetPath: string; petJsonPath: string }> {
  const petDir = getPetDir(pet.slug);
  fs.mkdirSync(petDir, { recursive: true });

  const spritesheetExt = resolveExtension(pet.spritesheetUrl);
  const spritesheetPath = path.join(petDir, `spritesheet${spritesheetExt}`);
  const petJsonPath = path.join(petDir, "pet.json");

  await downloadWithProgress(pet.spritesheetUrl, spritesheetPath, "spritesheet", onProgress);
  await downloadWithProgress(pet.petJsonUrl, petJsonPath, "metadata", onProgress);

  return { spritesheetPath, petJsonPath };
}

export function isPetDownloaded(slug: string): boolean {
  const petDir = getPetDir(slug);
  if (!fs.existsSync(petDir)) return false;

  const files = fs.readdirSync(petDir);
  const hasSpritesheet = files.some(
    (f) => f.startsWith("spritesheet.") && (f.endsWith(".webp") || f.endsWith(".png"))
  );
  const hasPetJson = files.includes("pet.json");

  return hasSpritesheet && hasPetJson;
}
