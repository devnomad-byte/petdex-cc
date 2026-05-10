import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { findPetBySlug } from "../petdex-api/client.js";
import { downloadPetAssets, isPetDownloaded } from "../petdex-api/download.js";

export async function switchPet(slug: string): Promise<void> {
  if (!isPetDownloaded(slug)) {
    console.log(`Downloading "${slug}"...`);
    const pet = await findPetBySlug(slug);
    if (!pet) {
      console.error(`Pet "${slug}" not found on Petdex.`);
      process.exit(1);
    }
    await downloadPetAssets(pet);
  }

  const portFile = join(homedir(), ".petdex-cc", "data", "port.lock");
  let port = 17321;
  try {
    port = Number(readFileSync(portFile, "utf8").trim()) || 17321;
  } catch {}

  try {
    await fetch(`http://localhost:${port}/switch-pet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    console.log(`Switched to "${slug}"!`);
  } catch {
    console.log("Pet is not running. Start it first with `petdex-cc start`.");
  }
}
