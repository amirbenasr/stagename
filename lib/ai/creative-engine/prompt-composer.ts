// ============================================================
// Prompt Composer — Modular prompt assembly
// ============================================================

import type { CreativeDirection } from "./types";
import { IDENTITY_DIRECTIVE } from "./identity";
import { fashionToPromptText } from "./fashion";
import { poseToPromptText } from "./pose";
import { photographerToPromptText } from "./photographer";
import { lightingToPromptText } from "./lighting";
import { qualityToPromptText } from "./quality";

export class PromptComposer {
  private sections: string[] = [];

  add(text: string): this {
    if (text.trim()) {
      this.sections.push(text.trim());
    }
    return this;
  }

  build(): string {
    return this.sections.join(". ");
  }

  reset(): this {
    this.sections = [];
    return this;
  }
}

export function composePortraitPrompt(direction: CreativeDirection, stageName: string): string {
  const composer = new PromptComposer();

  // Identity
  composer.add(IDENTITY_DIRECTIVE);

  // Persona / archetype mood
  composer.add(
    `${direction.archetype.name} aesthetic — ${direction.archetype.mood.join(", ")}. ` +
    `${direction.archetype.editorialStyle}`
  );

  // Fashion
  composer.add(`Wearing: ${fashionToPromptText(direction.fashion)}`);

  // Pose
  composer.add(`Pose: ${poseToPromptText(direction.pose)}`);

  // Photographer
  composer.add(`Shot: ${photographerToPromptText(direction.photographer)}`);

  // Lighting
  composer.add(`Lighting: ${lightingToPromptText(direction.lighting)}`);

  // Scene (for portrait, scene is subtle/background)
  composer.add(`Environment: ${direction.scene.location}, ${direction.scene.atmosphere.join(", ")}`);

  // Quality
  composer.add(qualityToPromptText());

  // Stage name watermark
  composer.add(`"${stageName}"`);

  return composer.build();
}

export function composeArenaPrompt(direction: CreativeDirection, stageName: string): string {
  const composer = new PromptComposer();

  // Identity
  composer.add(IDENTITY_DIRECTIVE);

  // Persona / archetype mood
  composer.add(
    `${direction.archetype.name} aesthetic — ${direction.archetype.mood.join(", ")}. ` +
    `${direction.archetype.editorialStyle}`
  );

  // Fashion
  composer.add(`Wearing: ${fashionToPromptText(direction.fashion)}`);

  // Pose — performing on stage
  composer.add(`Pose: performing passionately on a massive arena stage, holding a microphone, mid-song with mouth open, dynamic body movement, arms reaching toward the crowd`);

  // Scene — arena with crowd
  const sceneText = [
    `massive sold-out arena stadium`,
    `tens of thousands of fans in the crowd`,
    `crowd with raised hands and glowing phone lights`,
    `enormous stage with LED screens and pyrotechnics`,
    `dramatic concert lighting with laser beams cutting through haze`,
    ...direction.scene.atmosphere,
    `color palette: ${direction.scene.colorPalette.join(", ")}`,
  ].join(", ");
  composer.add(`Scene: ${sceneText}`);

  // Photographer — concert photography style
  composer.add(`Shot: wide-angle concert photography from the photo pit, 24mm lens, f/2.8, capturing the artist from below stage level with the massive crowd visible behind and around, epic scale showing the enormity of the venue`);

  // Lighting — concert lighting
  composer.add(`Lighting: dramatic concert lighting rig, intense spotlights, colored LED wash in blue and magenta, strobe effects, volumetric haze catching the light beams, lens flare from stage lights, HDR`);

  // Quality
  composer.add(qualityToPromptText());

  // Stage name watermark
  composer.add(`"${stageName}"`);

  return composer.build();
}

export function composeStudioPrompt(direction: CreativeDirection, stageName: string): string {
  const composer = new PromptComposer();

  // Identity
  composer.add(IDENTITY_DIRECTIVE);

  // Persona / archetype mood
  composer.add(
    `${direction.archetype.name} aesthetic — ${direction.archetype.mood.join(", ")}. ` +
    `${direction.archetype.editorialStyle}`
  );

  // Fashion
  composer.add(`Wearing: ${fashionToPromptText(direction.fashion)}`);

  // Pose
  composer.add(`Pose: ${poseToPromptText(direction.pose)}`);

  // Scene — full environment for studio shot
  const sceneText = [
    direction.scene.location,
    ...direction.scene.atmosphere,
    `props: ${direction.scene.props.join(", ")}`,
    `color palette: ${direction.scene.colorPalette.join(", ")}`,
  ].join(", ");
  composer.add(`Scene: ${sceneText}`);

  // Photographer
  composer.add(`Shot: ${photographerToPromptText(direction.photographer)}`);

  // Lighting
  composer.add(`Lighting: ${lightingToPromptText(direction.lighting)}`);

  // Quality
  composer.add(qualityToPromptText());

  // Stage name context
  composer.add(`the person sitting confidently in front of a wall displaying a "${stageName}" logo`);

  return composer.build();
}
