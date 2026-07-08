// ============================================================
// Prompt Builders — Centralized AI prompt construction
// ============================================================

export function buildImageAnalysisSystemPrompt(): string {
  return (
    "You are a visual analyst. Describe the person in the image in detail for an " +
    "artist branding context. Focus on: face shape, skin tone, hair style and color, " +
    "notable accessories, clothing style, and overall aesthetic vibe. " +
    "Be specific and concise — max 150 words."
  );
}

export function buildImageAnalysisUserPrompt(): string {
  return (
    "Describe this person's look in detail for creating a consistent " +
    "AI-generated portrait of them."
  );
}

export function buildNameSystemPrompt(creativeAngle: string): string {
  return (
    `You are a high-end Music Creative Director specializing in artist brand development. ` +
    `Your creative angle is: ${creativeAngle}.\n\n` +
    `You MUST respond ONLY with valid JSON — no markdown, no extra text:\n` +
    `{ "name": "stage name", "reason": "2-3 sentence explanation of why this name fits this artist" }\n\n` +
    `Requirements:\n` +
    `- Generate exactly 1 stage name\n` +
    `- The name must reflect the artist's own identity, vibe, and aesthetic\n` +
    `- The reason must explain why the name fits THIS specific artist\n` +
    `- Name should be memorable, marketable, and suitable for streaming platforms\n` +
    `- Avoid cultural appropriation; ensure authenticity`
  );
}

export function buildNameUserPrompt(
  artistContext: string,
  imageAnalysis: string
): string {
  const base = `Create 1 brandable stage name for an artist with these characteristics:\n${artistContext}`;
  return imageAnalysis ? `${base}\n\nVisual profile: ${imageAnalysis}` : base;
}

export function buildLogoPrompt(stageName: string): string {
  return (
    `Minimalist artist logo design for "${stageName}", clean typography, iconic symbol, ` +
    `professional brand mark, suitable for social media and merchandise, vector-style design`
  );
}

export function buildStudioPhotoPrompt(stageName: string): string {
  return (
    `Professional studio photograph of this exact person, sitting confidently in front of ` +
    `their "${stageName}" logo on a wall behind them, cinematic lighting, fashion editorial ` +
    `style, high-end music artist branding photo, sharp focus, 8k quality, ` +
    `keep the person's face and features identical`
  );
}

export function buildPortraitPrompt(stageName: string): string {
  return (
    `Professional artist portrait photo of this exact person, stylish and atmospheric, ` +
    `cinematic lighting, suitable for Spotify profile artwork, high quality, ` +
    `keep the person's face and features identical, ${stageName}`
  );
}
