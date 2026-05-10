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

export async function downloadPetAssets(
  pet: PetManifestEntry
): Promise<{ spritesheetPath: string; petJsonPath: string }> {
  const petDir = getPetDir(pet.slug);

  fs.mkdirSync(petDir, { recursive: true });

  const spritesheetExt = resolveExtension(pet.spritesheetUrl);
  const spritesheetPath = path.join(petDir, `spritesheet${spritesheetExt}`);
  const petJsonPath = path.join(petDir, "pet.json");

  // Download spritesheet
  const spritesheetResponse = await fetch(pet.spritesheetUrl);
  if (!spritesheetResponse.ok) {
    throw new Error(
      `Failed to download spritesheet for ${pet.slug}: ${spritesheetResponse.status} ${spritesheetResponse.statusText}`
    );
  }
  const spritesheetBuffer = Buffer.from(await spritesheetResponse.arrayBuffer());
  fs.writeFileSync(spritesheetPath, spritesheetBuffer);

  // Download pet.json
  const petJsonResponse = await fetch(pet.petJsonUrl);
  if (!petJsonResponse.ok) {
    throw new Error(
      `Failed to download pet.json for ${pet.slug}: ${petJsonResponse.status} ${petJsonResponse.statusText}`
    );
  }
  const petJsonBuffer = Buffer.from(await petJsonResponse.arrayBuffer());
  fs.writeFileSync(petJsonPath, petJsonBuffer);

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
