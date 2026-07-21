// ============================================================
// Artist Archetypes — Replace generic genre mappings
// ============================================================

import type { ArchetypeDefinition } from "./types";

export const DARK_LUXURY: ArchetypeDefinition = {
  id: "dark-luxury",
  name: "Dark Luxury",
  mood: ["mysterious", "powerful", "sophisticated"],
  fashionLanguage: "structured tailoring, premium dark fabrics, minimal hardware, monochromatic black with texture contrast",
  visualTone: "deep shadows, rich blacks, subtle metallic accents",
  atmosphere: ["opulent", "brooding", "cinematic"],
  editorialStyle: "Vogue Homme noir editorial, high-contrast monochrome",
};

export const LUXURY_RAP: ArchetypeDefinition = {
  id: "luxury-rap",
  name: "Luxury Rap",
  mood: ["confident", "bold", "aspirational"],
  fashionLanguage: "designer streetwear, statement jewelry, premium sneakers, layered chains, logo-forward pieces",
  visualTone: "warm gold tones, rich jewel colors, high saturation",
  atmosphere: ["aspirational", "flashy", "commanding"],
  editorialStyle: "Rolling Stone cover shoot, luxury lifestyle editorial",
};

export const STREET_AVANT: ArchetypeDefinition = {
  id: "street-avant",
  name: "Street Avant",
  mood: ["edgy", "unconventional", "raw"],
  fashionLanguage: "deconstructed silhouettes, oversized layers, mixed textures, avant-garde streetwear, unconventional proportions",
  visualTone: "high contrast, desaturated with pops of neon or primary color",
  atmosphere: ["gritty", "artistic", "disruptive"],
  editorialStyle: "Dazed & Confused editorial, underground fashion zine",
};

export const MINIMAL_POP: ArchetypeDefinition = {
  id: "minimal-pop",
  name: "Minimal Pop",
  mood: ["clean", "bright", "effortless"],
  fashionLanguage: "minimalist designer pieces, clean lines, neutral palette with one statement piece, effortless styling",
  visualTone: "bright, airy, high-key, soft pastels",
  atmosphere: ["polished", "approachable", "radiant"],
  editorialStyle: "Elle magazine pop feature, clean commercial editorial",
};

export const RETRO_SOUL: ArchetypeDefinition = {
  id: "retro-soul",
  name: "Retro Soul",
  mood: ["warm", "nostalgic", "intimate"],
  fashionLanguage: "vintage-inspired tailoring, warm earth tones, classic fabrics like suede and corduroy, retro accessories",
  visualTone: "warm amber, film grain, golden hour palette",
  atmosphere: ["soulful", "timeless", "intimate"],
  editorialStyle: "Analog film aesthetic, 70s soul album cover photography",
};

export const CYBER_FUTURE: ArchetypeDefinition = {
  id: "cyber-future",
  name: "Cyber Future",
  mood: ["futuristic", "electric", "boundary-pushing"],
  fashionLanguage: "techwear, reflective fabrics, LED accents, futuristic silhouettes, synthetic materials",
  visualTone: "neon blue and magenta, cool chrome, electric highlights",
  atmosphere: ["futuristic", "immersive", "digital"],
  editorialStyle: "Wired magazine feature, cyberpunk editorial photography",
};

export const EXPERIMENTAL_EDITORIAL: ArchetypeDefinition = {
  id: "experimental-editorial",
  name: "Experimental Editorial",
  mood: ["avant-garde", "artistic", "unconventional"],
  fashionLanguage: "high-fashion avant-garde, sculptural pieces, unconventional materials, artistic statement garments",
  visualTone: "abstract color grading, dramatic shadows, artistic composition",
  atmosphere: ["artistic", "provocative", "gallery-worthy"],
  editorialStyle: "i-D magazine cover, high-fashion art photography",
};

export const ROOTS_RIDIM: ArchetypeDefinition = {
  id: "roots-ridim",
  name: "Roots Ridim",
  mood: ["vibrant", "grounded", "cultural"],
  fashionLanguage: "vibrant prints, cultural textiles, bold patterns, handcrafted jewelry, natural fabrics",
  visualTone: "rich warm tones, golden sunlight, saturated earth colors",
  atmosphere: ["vibrant", "authentic", "celebratory"],
  editorialStyle: "Afrobeats visual album aesthetic, cultural editorial photography",
};

export const DESERT_NOIR: ArchetypeDefinition = {
  id: "desert-noir",
  name: "Desert Noir",
  mood: ["lone", "vast", " contemplative"],
  fashionLanguage: "desert-appropriate layers, worn leather, dusty tones, western-meets-streetwear, sun-bleached fabrics",
  visualTone: "harsh sunlight, deep shadows, warm desaturated palette",
  atmosphere: ["isolated", "epic", "mythic"],
  editorialStyle: "Western cinematic editorial, wide-open landscape portraiture",
};

// Genre → Archetype mapping
export const GENRE_ARCHETYPE_MAP: Record<string, ArchetypeDefinition> = {
  "Hip-Hop": LUXURY_RAP,
  "R&B": RETRO_SOUL,
  "Pop": MINIMAL_POP,
  "Electronic / EDM": CYBER_FUTURE,
  "Rock / Indie": STREET_AVANT,
  "Afrobeats / Amapiano": ROOTS_RIDIM,
  "Latin / Reggaeton": LUXURY_RAP,
  "Jazz / Soul": RETRO_SOUL,
  "Experimental": EXPERIMENTAL_EDITORIAL,
  "Country / Folk": DESERT_NOIR,
};

export function getArchetypeForGenre(genre: string): ArchetypeDefinition {
  return GENRE_ARCHETYPE_MAP[genre] ?? DARK_LUXURY;
}

export const ALL_ARCHETYPES: ArchetypeDefinition[] = [
  DARK_LUXURY,
  LUXURY_RAP,
  STREET_AVANT,
  MINIMAL_POP,
  RETRO_SOUL,
  CYBER_FUTURE,
  EXPERIMENTAL_EDITORIAL,
  ROOTS_RIDIM,
  DESERT_NOIR,
];
