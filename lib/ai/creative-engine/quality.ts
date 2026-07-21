// ============================================================
// Rendering Quality — Centralized render instructions
// ============================================================

export const QUALITY_TOKENS: string[] = [
  "natural skin pores",
  "organic hair strands",
  "premium material textures",
  "realistic stitching and fabric folds",
  "accurate jewelry reflections",
  "photorealistic",
  "filmic color grading",
  "ultra-detailed",
  "8k resolution",
];

export function qualityToPromptText(): string {
  return QUALITY_TOKENS.join(", ");
}
