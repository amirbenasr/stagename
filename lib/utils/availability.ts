import type { NameAvailability, PlatformAvailability } from "../types";
import { slugify } from "./text-utils";

const API_URL = "https://username-checker-714751050242.us-central1.run.app/check";

const PLATFORM_MAP: Record<string, keyof NameAvailability> = {
  Spotify: "spotify",
  Instagram: "instagram",
  SoundCloud: "soundcloud",
};

function emptyResult(): PlatformAvailability {
  return { available: false, handle: null };
}

export async function checkAvailability(name: string): Promise<NameAvailability> {
  const slug = slugify(name);

  const base: NameAvailability = {
    spotify: emptyResult(),
    instagram: emptyResult(),
    soundcloud: emptyResult(),
  };

  try {
    const res = await fetch(`${API_URL}?username=${encodeURIComponent(slug)}`, {
      signal: AbortSignal.timeout(50_000),
    });

    if (!res.ok) return base;

    const data = await res.json();

    for (const result of data.results ?? []) {
      const key = PLATFORM_MAP[result.platform];
      if (!key) continue;

      const available = result.status === "available";
      base[key] = {
        available,
        handle: available ? `@${slug}` : null,
      };
    }
  } catch {
    // API unreachable — return all unavailable
  }

  return base;
}

// Kept for dev/testing — no longer used in production pipeline
type PlatformKey = keyof NameAvailability;

const PLATFORM_KEYS: PlatformKey[] = ["spotify", "instagram", "soundcloud"];

function computePlatformAvailability(
  name: string,
  platform: PlatformKey
): PlatformAvailability {
  const slug = slugify(name);
  const hash = slug.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const isUniqueName = name.split(" ").length >= 2 || name.length > 8;
  const seed = hash + platform.length;
  const available = isUniqueName ? seed % 3 !== 0 : seed % 2 === 0;

  return {
    available,
    handle: available
      ? `@${slug}`
      : null,
  };
}

export function simulateAvailability(name: string): NameAvailability {
  return PLATFORM_KEYS.reduce(
    (acc, platform) => ({
      ...acc,
      [platform]: computePlatformAvailability(name, platform),
    }),
    {} as NameAvailability
  );
}
