// ============================================================
// Scene Presets — Independent, swappable environments
// ============================================================

import type { ScenePreset } from "./types";

export const WOODS: ScenePreset = {
  name: "woods",
  location: "dense evergreen forest",
  atmosphere: ["morning mist", "cinematic fog", "quiet solitude"],
  props: ["ferns", "fallen logs", "moss-covered stones"],
  lightingHints: ["soft sun rays through canopy", "diffused daylight", "volumetric light shafts"],
  colorPalette: ["deep green", "earth brown", "soft gold", "muted sage"],
  cameraSuggestions: ["medium full body", "slightly low angle", "shallow depth of field"],
};

export const LUXURY_STUDIO: ScenePreset = {
  name: "luxury-studio",
  location: "high-end recording studio with acoustic paneling",
  atmosphere: ["professional", "intimate", "sonic precision"],
  props: ["vintage microphone", "mixing console", "leather chair", "vinyl records"],
  lightingHints: ["warm practical lights", "soft overhead key", "subtle colored accent"],
  colorPalette: ["warm amber", "deep mahogany", "brushed gold", "charcoal"],
  cameraSuggestions: ["medium shot", "eye level", "environmental portrait"],
};

export const ROOFTOP: ScenePreset = {
  name: "rooftop",
  location: "urban rooftop at golden hour",
  atmosphere: ["expansive", "aspirational", "city energy"],
  props: ["skylines", "water tanks", "antenna arrays", "concrete ledge"],
  lightingHints: ["golden hour backlight", "warm rim light", "soft fill from sky"],
  colorPalette: ["warm orange", "deep blue", "concrete gray", "golden yellow"],
  cameraSuggestions: ["medium full body", "slight low angle", "city skyline backdrop"],
};

export const RAINY_STREET: ScenePreset = {
  name: "rainy-street",
  location: "rain-soaked city street at night",
  atmosphere: ["moody", "cinematic", "neon-lit solitude"],
  props: ["wet asphalt reflections", "neon signs", "taxi cabs", "steam from grates"],
  lightingHints: ["neon reflections on wet ground", "practical street lights", "colored bounce light"],
  colorPalette: ["electric blue", "neon pink", "deep black", "warm amber"],
  cameraSuggestions: ["medium shot", "eye level", "reflections in frame"],
};

export const DESERT: ScenePreset = {
  name: "desert",
  location: "vast open desert with sand dunes",
  atmosphere: ["isolated", "epic", "timeless"],
  props: ["sand dunes", "dry brush", "distant mountains", "open sky"],
  lightingHints: ["harsh directional sunlight", "deep shadows", "warm golden tones"],
  colorPalette: ["sand gold", "burnt sienna", "bleached white", "deep cobalt sky"],
  cameraSuggestions: ["wide environmental portrait", "low angle", "subject small in landscape"],
};

export const VININTAGE_LOUNGE: ScenePreset = {
  name: "vintage-lounge",
  location: "dimly lit retro lounge with velvet furnishings",
  atmosphere: ["intimate", "nostalgic", "smoky warmth"],
  props: ["velvet sofa", "brass lamp", "old jukebox", "crystal glasses"],
  lightingHints: ["warm practical lamps", "soft amber glow", "subtle smoke haze"],
  colorPalette: ["deep burgundy", "warm brass", "cream", "dark walnut"],
  cameraSuggestions: ["medium close-up", "slightly high angle", "warm color grade"],
};

export const GRAFFITI_ALLEY: ScenePreset = {
  name: "graffiti-alley",
  location: "narrow alley covered in vibrant street art",
  atmosphere: ["raw", "energetic", "underground"],
  props: ["spray paint cans", "layered murals", "chain-link fence", "concrete"],
  lightingHints: ["overcast diffused daylight", "colorful bounce from murals", "harsh shadow lines"],
  colorPalette: ["vibrant multi-color", "concrete gray", "saturated primaries"],
  cameraSuggestions: ["medium shot", "eye level", "art as backdrop"],
};

export const PENTHOUSE: ScenePreset = {
  name: "penthouse",
  location: "minimalist luxury penthouse with floor-to-ceiling windows",
  atmosphere: ["aspirational", "serene", "power"],
  props: ["designer furniture", "abstract art", "city panorama", "marble surfaces"],
  lightingHints: ["natural window light", "soft diffused daylight", "warm interior accents"],
  colorPalette: ["clean white", "warm gray", "accent gold", "deep navy"],
  cameraSuggestions: ["medium full body", "eye level", "window light as key"],
};

export const ALL_SCENES: ScenePreset[] = [
  WOODS,
  LUXURY_STUDIO,
  ROOFTOP,
  RAINY_STREET,
  DESERT,
  VININTAGE_LOUNGE,
  GRAFFITI_ALLEY,
  PENTHOUSE,
];

export function getSceneForArchetype(archetypeId: string): ScenePreset {
  const mapping: Record<string, ScenePreset> = {
    "dark-luxury": LUXURY_STUDIO,
    "luxury-rap": PENTHOUSE,
    "street-avant": GRAFFITI_ALLEY,
    "minimal-pop": ROOFTOP,
    "retro-soul": VININTAGE_LOUNGE,
    "cyber-future": RAINY_STREET,
    "experimental-editorial": WOODS,
    "roots-ridim": DESERT,
    "desert-noir": DESERT,
  };
  return mapping[archetypeId] ?? LUXURY_STUDIO;
}
