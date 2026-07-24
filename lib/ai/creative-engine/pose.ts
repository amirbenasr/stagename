// ============================================================
// Pose Presets — Reusable posture definitions
// ============================================================

import type { PosePreset } from "./types";

export const CONFIDENT_STANDING: PosePreset = {
  name: "confident-standing",
  posture: "standing tall with natural spine alignment",
  shoulders: "relaxed shoulders, slight asymmetry",
  expression: "direct eye contact, calm confidence",
  hands: "one hand in pocket, other relaxed at side",
  energy: "effortless authority",
};

export const SEATED_RELAXED: PosePreset = {
  name: "seated-relaxed",
  posture: "seated with legs crossed or open, leaning slightly back",
  shoulders: "dropped and relaxed",
  expression: "contemplative half-smile, looking slightly off-camera",
  hands: "resting on knee or armrest",
  energy: "casual ease",
};

export const EDITORIAL_LEAN: PosePreset = {
  name: "editorial-lean",
  posture: "leaning against wall or surface, weight on one leg",
  shoulders: "one shoulder slightly raised",
  expression: "intense gaze, jaw slightly set",
  hands: "arms crossed or hand adjusting collar",
  energy: "cool detachment",
};

export const DYNAMIC_WALK: PosePreset = {
  name: "dynamic-walk",
  posture: "mid-stride, natural forward momentum",
  shoulders: "natural rotation, relaxed",
  expression: "looking ahead, purposeful",
  hands: "natural swing, one hand slightly raised",
  energy: "forward motion",
};

export const CONTEMPLATIVE: PosePreset = {
  name: "contemplative",
  posture: "seated or standing, slight forward lean",
  shoulders: "relaxed, slightly hunched",
  expression: "eyes downcast or gazing into distance, thoughtful",
  hands: "hand near chin or resting on surface",
  energy: "introspective depth",
};

export const POWER_STANCE: PosePreset = {
  name: "power-stance",
  posture: "feet shoulder-width apart, planted firmly",
  shoulders: "back and broad",
  expression: "direct unwavering eye contact, slight smirk",
  hands: "at sides or one hand on hip",
  energy: "commanding presence",
};

export const ALL_POSES: PosePreset[] = [
  CONFIDENT_STANDING,
  SEATED_RELAXED,
  EDITORIAL_LEAN,
  DYNAMIC_WALK,
  CONTEMPLATIVE,
  POWER_STANCE,
];

export function getPoseForArchetype(archetypeId: string, variantIndex: number = 0): PosePreset {
  const mapping: Record<string, PosePreset[]> = {
    "dark-luxury": [EDITORIAL_LEAN, CONTEMPLATIVE, CONFIDENT_STANDING],
    "luxury-rap": [POWER_STANCE, SEATED_RELAXED, CONFIDENT_STANDING],
    "street-avant": [EDITORIAL_LEAN, DYNAMIC_WALK, CONTEMPLATIVE],
    "minimal-pop": [CONFIDENT_STANDING, DYNAMIC_WALK, SEATED_RELAXED],
    "retro-soul": [SEATED_RELAXED, CONTEMPLATIVE, CONFIDENT_STANDING],
    "cyber-future": [DYNAMIC_WALK, EDITORIAL_LEAN, POWER_STANCE],
    "experimental-editorial": [CONTEMPLATIVE, EDITORIAL_LEAN, DYNAMIC_WALK],
    "roots-ridim": [CONFIDENT_STANDING, DYNAMIC_WALK, EDITORIAL_LEAN],
    "desert-noir": [CONTEMPLATIVE, EDITORIAL_LEAN, CONFIDENT_STANDING],
  };
  const poses = mapping[archetypeId] ?? [CONFIDENT_STANDING];
  return poses[variantIndex % poses.length]!;
}

export function poseToPromptText(pose: PosePreset): string {
  return `${pose.posture}, ${pose.shoulders}, ${pose.expression}, ${pose.hands}`;
}
