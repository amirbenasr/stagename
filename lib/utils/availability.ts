import type { NameAvailability, PlatformAvailability } from "../types";
import { slugify } from "./text-utils";

type PlatformKey = keyof NameAvailability;

const PLATFORM_KEYS: PlatformKey[] = [
  "spotify",
  "appleMusic",
  "instagram",
  "facebook",
  "domainCom",
];

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
      ? platform === "domainCom"
        ? `${slug}.com`
        : `@${slug}`
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
