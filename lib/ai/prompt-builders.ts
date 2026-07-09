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
    `- The name must reflect the artist's own identity, vibe, aesthetic, and musical influences\n` +
    `- Pay special attention to the artist's listed influences — their sound lineage should inform the name\n` +
    `- The reason must explain why the name fits THIS specific artist\n` +
    `- Name should be memorable, marketable, and suitable for streaming platforms\n` +
    `- Avoid cultural appropriation; ensure authenticity\n` +
    `- IMPORTANT: Two other creative directors are generating names for this same artist using different angles. ` +
    `You MUST explore a naming direction they would NOT suggest — avoid obvious or common names, push toward something distinctive to your creative angle`
  );
}

export function buildNameUserPrompt(
  artistContext: string,
  imageAnalysis: string
): string {
  const base = `Create 1 brandable stage name for an artist with these characteristics:\n${artistContext}`;
  return imageAnalysis ? `${base}\n\nVisual profile: ${imageAnalysis}` : base;
}

export interface ImagePromptParams {
  stageName: string;
  genre?: string;
  vibe?: string;
}

export function buildLogoPrompt(stageName: string, genre?: string): string {
  const genreVibe = genre ? `, inspired by the aesthetic of ${genre} music culture` : "";
  return (
    `Minimalist artist logo design for "${stageName}"${genreVibe}, ` +
    `clean modern typography, iconic symbolic mark, professional brand identity, ` +
    `flat vector style, balanced composition, white background, ` +
    `suitable for streaming platforms social media and merchandise`
  );
}

export function buildStudioPhotoPrompt({ stageName, genre, vibe }: ImagePromptParams): string {
  const genreDirection = genre ? genreGenreDirection(genre) : "";
  const vibeDirection = vibe ? ` mood: ${vibe}` : "";

  return (
    `Hollywood studio photograph of this exact same person — DO NOT alter face shape, facial features, skin tone, or body structure. ` +
    `The person must be visually identical to the reference photo. ` +
    `Shot on ARRI Alexa 65, 85mm lens, f/2.8, shallow depth of field, ` +
    `three-point studio lighting with soft key light and subtle rim light, ` +
    `the person sitting confidently in a relaxed pose in front of a wall displaying ` +
    `a "${stageName}" logo, high-end music artist editorial photography${genreDirection}${vibeDirection}, ` +
    `color graded, photorealistic, ultra-detailed, 8k resolution, ` +
    `CRITICAL: preserve the exact facial features and physical appearance from the reference image`
  );
}

export function buildPortraitPrompt({ stageName, genre, vibe }: ImagePromptParams): string {
  const genreDirection = genre ? genreGenreDirection(genre) : "";
  const vibeDirection = vibe ? ` mood: ${vibe}` : "";

  return (
    `Hollywood studio headshot portrait of this exact same person — DO NOT alter face shape, facial features, skin tone, or body structure. ` +
    `The person must be visually identical to the reference photo. ` +
    `Shot on ARRI Alexa 65, 85mm lens, f/1.8, tight head-and-shoulders framing, ` +
    `Rembrandt lighting with subtle fill light, cinematic color grading, ` +
    `stylish atmospheric composition suitable for Spotify Apple Music profile artwork, ` +
    `high-end music artist branding${genreDirection}${vibeDirection}, ` +
    `photorealistic, ultra-detailed, 8k resolution, ` +
    `CRITICAL: preserve the exact facial features and physical appearance from the reference image, "${stageName}"`
  );
}

// Genre-specific visual direction tokens for image generation
function genreGenreDirection(genre: string): string {
  const directions: Record<string, string> = {
    "Hip-Hop": ", urban street aesthetic, gold chain accents, confident swagger pose, warm amber and deep purple color grading, hip-hop magazine editorial style",
    "R&B": ", smooth velvet aesthetic, warm golden hour lighting, sensual moody atmosphere, rich purple and magenta tones, R&B album cover photography style",
    "Pop": ", bright high-key lighting, vibrant saturated colors, clean polished commercial aesthetic, pop star magazine editorial, energetic and glamorous",
    "Electronic / EDM": ", neon-lit cyberpunk aesthetic, cool blue and electric pink lighting, futuristic club atmosphere, electronic music festival editorial style",
    "Rock / Indie": ", gritty analog film aesthetic, natural warm tones, raw edgy composition, rock band photography style, vintage film grain texture",
    "Afrobeats / Amapiano": ", vibrant warm golden lighting, rich earthy tones mixed with bright colors, confident African-inspired aesthetic, afrobeats music video editorial",
    "Latin / Reggaeton": ", warm tropical lighting, vibrant red and gold color palette, passionate energetic composition, reggaeton urban editorial photography style",
    "Jazz / Soul": ", moody low-key lighting, warm amber and deep brown tones, intimate jazz club atmosphere, classic soul album cover photography, film noir aesthetic",
    "Experimental": ", avant-garde artistic composition, unconventional lighting, abstract color grading, experimental art photography style, creative and boundary-pushing",
    "Country / Folk": ", natural warm golden hour lighting, rustic organic aesthetic, earthy tones and soft natural light, Americana folk photography style, open landscape feel",
  };
  return directions[genre] || "";
}
