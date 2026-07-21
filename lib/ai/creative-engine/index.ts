// ============================================================
// Creative Direction Engine — Barrel Export
// ============================================================

export type {
  SubjectAnalysis,
  ArchetypeDefinition,
  ScenePreset,
  FashionOutput,
  PosePreset,
  PhotographerPreset,
  LightingPreset,
  CreativeDirection,
} from "./types";

export { getArchetypeForGenre, ALL_ARCHETYPES } from "./archetypes";
export { getSceneForArchetype, ALL_SCENES } from "./scenes";
export { determineFashion, fashionToPromptText } from "./fashion";
export { getPoseForArchetype, ALL_POSES, poseToPromptText } from "./pose";
export { getPhotographerForScene, ALL_PHOTOGRAPHERS, photographerToPromptText } from "./photographer";
export { getLightingForScene, ALL_LIGHTING, lightingToPromptText } from "./lighting";
export { QUALITY_TOKENS, qualityToPromptText } from "./quality";
export { IDENTITY_DIRECTIVE } from "./identity";
export { PromptComposer, composePortraitPrompt, composeStudioPrompt } from "./prompt-composer";

import type { SubjectAnalysis } from "./types";
import { getArchetypeForGenre } from "./archetypes";
import { getSceneForArchetype } from "./scenes";
import { determineFashion } from "./fashion";
import { getPoseForArchetype } from "./pose";
import { getPhotographerForScene } from "./photographer";
import { getLightingForScene } from "./lighting";
import type { CreativeDirection } from "./types";

export function buildCreativeDirection(
  subject: SubjectAnalysis,
  genre: string
): CreativeDirection {
  const archetype = getArchetypeForGenre(genre);
  const scene = getSceneForArchetype(archetype.id);
  const fashion = determineFashion(subject, archetype);
  const pose = getPoseForArchetype(archetype.id);
  const photographer = getPhotographerForScene(scene.name);
  const lighting = getLightingForScene(scene.name);

  return {
    subject,
    archetype,
    fashion,
    scene,
    pose,
    photographer,
    lighting,
    quality: [],
  };
}
