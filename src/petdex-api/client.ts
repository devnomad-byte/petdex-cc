const MANIFEST_URL = "https://petdex.crafter.run/api/manifest";

export interface PetManifestEntry {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  spritesheetUrl: string;
  petJsonUrl: string;
  zipUrl: string;
  kind: string;
  vibes: string[];
  tags: string[];
  dominantColor: string;
}

export async function fetchManifest(): Promise<PetManifestEntry[]> {
  const response = await fetch(MANIFEST_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch manifest: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return (data.pets ?? data) as PetManifestEntry[];
}

export async function findPetBySlug(
  slug: string
): Promise<PetManifestEntry | null> {
  const manifest = await fetchManifest();
  const lowerSlug = slug.toLowerCase();
  return manifest.find((pet) => pet.slug.toLowerCase() === lowerSlug) ?? null;
}

export async function listPets(): Promise<
  { slug: string; displayName: string; kind: string }[]
> {
  const manifest = await fetchManifest();
  return manifest.map((pet) => ({
    slug: pet.slug,
    displayName: pet.displayName,
    kind: pet.kind,
  }));
}
