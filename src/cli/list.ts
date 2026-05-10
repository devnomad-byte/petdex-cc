import { listPets } from "../petdex-api/client.js";

export async function list(): Promise<void> {
  try {
    const pets = await listPets();
    if (pets.length === 0) {
      console.log("No pets found.");
      return;
    }
    console.log(`Found ${pets.length} pets:\n`);
    console.log("  Slug".padEnd(30) + "Name".padEnd(30) + "Kind");
    console.log("-".repeat(70));
    for (const pet of pets) {
      console.log(`  ${pet.slug.padEnd(28)}${pet.displayName.padEnd(30)}${pet.kind}`);
    }
  } catch {
    console.log("Could not fetch pet list. Check your internet connection.");
  }
}
