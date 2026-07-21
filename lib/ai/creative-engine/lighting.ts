// ============================================================
// Lighting Presets — Independent lighting direction
// ============================================================

import type { LightingPreset } from "./types";

export const STUDIO_SOFT: LightingPreset = {
  name: "studio-soft",
  key: "large softbox key light at 45 degrees",
  fill: "subtle fill light on opposite side",
  accent: "rim light for separation",
  mood: "clean, professional, flattering",
};

export const GOLDEN_HOUR: LightingPreset = {
  name: "golden-hour",
  key: "warm low-angle sunlight as key",
  fill: "sky bounce as natural fill",
  accent: "warm rim light from sun behind subject",
  mood: "warm, nostalgic, cinematic",
};

export const NEON_NIGHT: LightingPreset = {
  name: "neon-night",
  key: "practical neon signs as key light",
  fill: "colored bounce from wet surfaces",
  accent: "neon reflections and lens flares",
  mood: "electric, moody, cyberpunk",
};

export const REMBRANDT: LightingPreset = {
  name: "rembrandt",
  key: "single directional key creating triangle on cheek",
  fill: "minimal fill, deep shadows",
  accent: "subtle hair light",
  mood: "dramatic, classical, painterly",
};

export const OVERCAST_DIFFUSED: LightingPreset = {
  name: "overcast-diffused",
  key: "soft overcast sky as large diffused key",
  fill: "even ambient fill, no harsh shadows",
  accent: "subtle backlight for separation",
  mood: "soft, even, editorial",
};

export const HARSH_SUN: LightingPreset = {
  name: "harsh-sun",
  key: "direct overhead sunlight",
  fill: "deep contrast shadows",
  accent: "bright highlights on skin and fabric",
  mood: "raw, intense, unforgiving",
};

export const PRACTICAL_WARM: LightingPreset = {
  name: "practical-warm",
  key: "warm practical lamps in scene",
  fill: "ambient warm glow",
  accent: "firelight or candlelight flicker",
  mood: "intimate, cozy, vintage",
};

export const ALL_LIGHTING: LightingPreset[] = [
  STUDIO_SOFT,
  GOLDEN_HOUR,
  NEON_NIGHT,
  REMBRANDT,
  OVERCAST_DIFFUSED,
  HARSH_SUN,
  PRACTICAL_WARM,
];

export function getLightingForScene(sceneName: string): LightingPreset {
  const mapping: Record<string, LightingPreset> = {
    "woods": OVERCAST_DIFFUSED,
    "luxury-studio": STUDIO_SOFT,
    "rooftop": GOLDEN_HOUR,
    "rainy-street": NEON_NIGHT,
    "desert": HARSH_SUN,
    "vintage-lounge": PRACTICAL_WARM,
    "graffiti-alley": OVERCAST_DIFFUSED,
    "penthouse": GOLDEN_HOUR,
  };
  return mapping[sceneName] ?? STUDIO_SOFT;
}

export function lightingToPromptText(l: LightingPreset): string {
  return `${l.key}, ${l.fill}, ${l.accent}`;
}
