// ============================================================
// Creative Direction Engine — Shared Types
// ============================================================

export interface SubjectAnalysis {
  face: {
    shape: string;
    jaw: string;
    skinTone: string;
    undertone: "warm" | "cool" | "neutral";
    hair: string;
    facialHair?: string;
  };
  body: {
    build: string;
    shoulders: string;
    height: string;
  };
  vibe: {
    confidence: number;
    expression: string;
    perceivedAge: number;
  };
}

export interface ArchetypeDefinition {
  id: string;
  name: string;
  mood: string[];
  fashionLanguage: string;
  visualTone: string;
  atmosphere: string[];
  editorialStyle: string;
}

export interface ScenePreset {
  name: string;
  location: string;
  atmosphere: string[];
  props: string[];
  lightingHints: string[];
  colorPalette: string[];
  cameraSuggestions: string[];
}

export interface FashionOutput {
  top: string;
  bottom: string;
  footwear: string;
  accessories: string[];
  notes?: string;
}

export interface PosePreset {
  name: string;
  posture: string;
  shoulders: string;
  expression: string;
  hands: string;
  energy: string;
}

export interface PhotographerPreset {
  name: string;
  camera: string;
  lens: string;
  framing: string;
  composition: string;
  editorialQuality: string;
}

export interface LightingPreset {
  name: string;
  key: string;
  fill: string;
  accent: string;
  mood: string;
}

export interface CreativeDirection {
  subject: SubjectAnalysis;
  archetype: ArchetypeDefinition;
  fashion: FashionOutput;
  scene: ScenePreset;
  pose: PosePreset;
  photographer: PhotographerPreset;
  lighting: LightingPreset;
  quality: string[];
}
