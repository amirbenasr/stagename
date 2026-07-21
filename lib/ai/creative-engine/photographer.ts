// ============================================================
// Photographer Presets — Camera, lens, composition decisions
// ============================================================

import type { PhotographerPreset } from "./types";

export const EDITORIAL_LUXURY: PhotographerPreset = {
  name: "editorial-luxury",
  camera: "ARRI Alexa 65",
  lens: "85mm f/1.8",
  framing: "medium close-up, head and shoulders",
  composition: "rule of thirds, negative space for text",
  editorialQuality: "luxury magazine editorial, natural skin texture, filmic color science",
};

export const CINEMATIC_WIDE: PhotographerPreset = {
  name: "cinematic-wide",
  camera: "ARRI Alexa Mini LF",
  lens: "35mm f/2.0",
  framing: "medium full body with environmental context",
  composition: "subject in environment, leading lines",
  editorialQuality: "cinematic film still, anamorphic lens characteristics, natural skin",
};

export const INTIMATE_PORTRAIT: PhotographerPreset = {
  name: "intimate-portrait",
  camera: "Hasselblad X2D",
  lens: "90mm f/2.5",
  framing: "tight headshot, crop at chest",
  composition: "centered or slight off-axis, shallow DOF",
  editorialQuality: "high-end portrait photography, visible skin pores, photorealistic",
};

export const STREET_DOCUMENTARY: PhotographerPreset = {
  name: "street-documentary",
  camera: "Leica SL2",
  lens: "50mm f/1.4",
  framing: "medium shot, waist up",
  composition: "candid framing, environmental storytelling",
  editorialQuality: "documentary photography style, natural grain, authentic feel",
};

export const FASHION_EDITORIAL: PhotographerPreset = {
  name: "fashion-editorial",
  camera: "Phase One IQ4",
  lens: "110mm f/2.8",
  framing: "full body to head, fashion proportions",
  composition: "high fashion layout, dramatic angles",
  editorialQuality: "Vogue-quality fashion photography, premium material textures, fabric folds",
};

export const ALL_PHOTOGRAPHERS: PhotographerPreset[] = [
  EDITORIAL_LUXURY,
  CINEMATIC_WIDE,
  INTIMATE_PORTRAIT,
  STREET_DOCUMENTARY,
  FASHION_EDITORIAL,
];

export function getPhotographerForScene(sceneName: string): PhotographerPreset {
  const mapping: Record<string, PhotographerPreset> = {
    "woods": CINEMATIC_WIDE,
    "luxury-studio": EDITORIAL_LUXURY,
    "rooftop": CINEMATIC_WIDE,
    "rainy-street": STREET_DOCUMENTARY,
    "desert": CINEMATIC_WIDE,
    "vintage-lounge": INTIMATE_PORTRAIT,
    "graffiti-alley": STREET_DOCUMENTARY,
    "penthouse": FASHION_EDITORIAL,
  };
  return mapping[sceneName] ?? EDITORIAL_LUXURY;
}

export function photographerToPromptText(p: PhotographerPreset): string {
  return `${p.camera}, ${p.lens}, ${p.framing}, ${p.composition}, ${p.editorialQuality}`;
}
