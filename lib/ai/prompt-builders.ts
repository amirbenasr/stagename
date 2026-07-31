// ============================================================
// Prompt Builders — Centralized AI prompt construction
// ============================================================

import type { SubjectAnalysis } from "./creative-engine/types";
import { buildCreativeDirection, composePortraitPrompt, composeStudioPrompt, composeArenaPrompt } from "./creative-engine";

export function buildImageAnalysisSystemPrompt(): string {
  return (
    "You are a visual analyst. Analyze the person in the image and return structured JSON. " +
    "You MUST respond ONLY with valid JSON — no markdown, no extra text.\n\n" +
    "Return this exact structure:\n" +
    "{\n" +
    '  "face": {\n' +
    '    "shape": "oval|round|square|heart|oblong",\n' +
    '    "jaw": "sharp|soft|angular|rounded",\n' +
    '    "skinTone": "specific skin tone description",\n' +
    '    "undertone": "warm|cool|neutral",\n' +
    '    "hair": "hair style, length, color, texture",\n' +
    '    "facialHair": "beard/mustache description or null"\n' +
    "  },\n" +
    '  "body": {\n' +
    '    "build": "slim|athletic|muscular|average|stocky",\n' +
    '    "shoulders": "narrow|average|broad",\n' +
    '    "height": "short|average|tall"\n' +
    "  },\n" +
    '  "vibe": {\n' +
    '    "confidence": 0.0-1.0,\n' +
    '    "expression": "description of facial expression",\n' +
    '    "perceivedAge": 0\n' +
    "  }\n" +
    "}"
  );
}

export function buildImageAnalysisUserPrompt(): string {
  return "Analyze this person and return the structured JSON.";
}

export function buildNameSystemPrompt(
  creativeAngle: string,
  realName: string,
  culturePreference: string
): string {
  const cultureGuidance = buildCultureGuidance(culturePreference);

  return (
    `You are a world-class Music Creative Director who creates unforgettable artist names through linguistics, branding, storytelling, and cultural insight.\n\n` +

    `WORKING PROCESS (follow internally):\n` +
    `1. Generate at least 20 distinct candidate names before selecting one.\n` +
    `2. Explore multiple naming strategies instead of staying in one creative lane.\n` +
    `3. Eliminate weak, generic, repetitive, or existing artist names.\n` +
    `4. Return only the strongest remaining candidate.\n\n` +

    `REAL NAME ANALYSIS\n` +
    `Analyze the artist's real name ("${realName}") for inspiration.\n` +
    `Consider:\n` +
    `- syllables\n` +
    `- phonetics\n` +
    `- rhythm\n` +
    `- hidden letter patterns\n` +
    `- etymology\n` +
    `- emotional associations\n\n` +
    `The real name is inspiration—not a constraint.\n\n` +

    `CULTURAL INSPIRATION\n` +
    `${cultureGuidance}\n\n` +
    `Use culture as inspiration rather than a vocabulary source.\n` +
    `The final name does NOT need to be an existing cultural word.\n` +
    `Instead, it may evoke the culture's history, philosophy, landscapes, architecture, mythology, craftsmanship, language, symbolism, or artistic traditions without directly borrowing famous terms.\n\n` +

    `CREATIVE STRATEGIES\n` +
    `Randomly choose ONE primary strategy:\n` +
    `- Abstract phonetic invention\n` +
    `- Transformation of the real name\n` +
    `- Invented mythology\n` +
    `- Symbolic cultural inspiration\n` +
    `- Emotional metaphor\n` +
    `- Rhythm-first naming\n` +
    `- Visual/logo-first naming\n` +
    `- Linguistic fusion\n` +
    `- Minimalist invented word\n` +
    `- Historical inspiration\n\n` +

    `You may use techniques such as:\n` +
    `- syllable extraction\n` +
    `- phonetic mutation\n` +
    `- anagrams\n` +
    `- letter inversion\n` +
    `- portmanteaus\n` +
    `- intentional respelling\n` +
    `- invented morphemes\n` +
    `- sound symbolism\n\n` +

    `VALIDATION\n` +
    `The chosen name should be:\n` +
    `- ideally 1–2 syllables\n` +
    `- ideally under 7 letters\n` +
    `- memorable when spoken\n` +
    `- visually distinctive as a logo\n` +
    `- globally pronounceable\n` +
    `- emotionally resonant\n` +
    `- capable of inspiring visual branding\n` +
    `- unlikely to be confused with existing artists\n\n` +

    `STRICT RULES\n` +
    `- Do NOT simply mash syllables together.\n` +
    `- Do NOT produce generic "cool sounding" names.\n` +
    `- Do NOT rely on the most famous cultural references.\n` +
    `- Avoid repeatedly using the same cultural roots across generations.\n` +
    `- The final name may be completely invented.\n` +
    `- Respect cultural authenticity and avoid appropriation.\n` +
    `- Another creative director is exploring different directions. Intentionally avoid the most obvious solution.\n\n` +

    `The explanation should clearly describe WHY this name exists—not just how it sounds.\n` +
    `The story may come from linguistic transformation, symbolism, emotion, visual identity, or cultural inspiration.\n\n` +

    `Respond ONLY with valid JSON:\n` +
    `{` +
    `"name":"stage name",` +
    `"reason":"2-3 sentences explaining the creative reasoning, symbolism, and branding potential."` +
    `}`
  );
}

function buildCultureGuidance(culturePreference: string): string {
  if (culturePreference.includes("Deep") || culturePreference.includes("heritage") || culturePreference.includes("DNA")) {
    return (
      "The artist wants their cultural heritage DEEPLY woven into the name. " +
      "Use a word, concept, or term from their cultural background as the PRIMARY raw material. " +
      "The name should carry the weight and story of their origin — transformed but unmistakably rooted."
    );
  }
  if (culturePreference.includes("Subtle") || culturePreference.includes("nod")) {
    return (
      "The artist wants a SUBTLE nod to their roots — globally fluent but with a hidden cultural layer. " +
      "The name should sound universal on the surface, but those who know will recognize the cultural reference. " +
      "Think: a phonetic echo of a cultural word, or a respelling that works in multiple languages."
    );
  }
  if (culturePreference.includes("None") || culturePreference.includes("universal")) {
    return (
      "The artist wants a UNIVERSAL name with no explicit cultural markers. " +
      "Focus purely on phonetic beauty, memorability, and visual impact. " +
      "The name should feel like it belongs everywhere and nowhere — pure global artist identity."
    );
  }
  if (culturePreference.includes("Surprise")) {
    return (
      "SURPRISE the artist — find a connection they can't see themselves. " +
      "Look for unexpected links between their real name's etymology, their cultural roots, " +
      "and universal concepts. The name should make them say 'I never thought of that — but it's perfect.'"
    );
  }
  return "Use cultural elements thoughtfully to enrich the name.";
}

export function buildNameUserPrompt(
  artistContext: string,
  imageAnalysis: string,
  realName: string,
  culturePreference: string
): string {
  const parts = [
    `Create 1 brandable stage name for this artist:`,
    ``,
    `Real name: ${realName}`,
    `Culture preference: ${culturePreference}`,
    ``,
    `Artist profile:`,
    artistContext,
  ];

  if (imageAnalysis) {
    parts.push(`\nVisual profile: ${imageAnalysis}`);
  }

  parts.push(
    `\nRemember: find a culturally meaningful word, transform it creatively, ` +
    `and validate it's short, memorable, globally pronounceable, and visually distinctive.`
  );

  return parts.join("\n");
}

export interface ImagePromptParams {
  stageName: string;
  genre?: string;
  vibe?: string;
  subjectAnalysis?: SubjectAnalysis;
  variantIndex?: number;
}

export function buildLogoPrompt(stageName: string, genre?: string): string {
  const genreVibe = genre ? ` for a ${genre} music artist` : "";
  return (
    `Professional minimalist logo design for "${stageName}"${genreVibe}. ` +
    `The text "${stageName}" must be rendered in bold, crisp, perfectly legible letterforms — ` +
    `every letter sharp and clearly defined. ` +
    `Clean vector aesthetic, modern iconic symbolic mark integrated with the text, ` +
    `professional music brand identity, flat design with strong geometric shapes, ` +
    `pure white background, high contrast, balanced composition. ` +
    `The logo must work at any size — from streaming platform thumbnail to billboard. ` +
    `Ultra-sharp rendering, no blur, no artifacts, print-quality resolution`
  );
}

export function buildStudioPhotoPrompt(params: ImagePromptParams): string {
  if (params.subjectAnalysis && params.genre) {
    const direction = buildCreativeDirection(params.subjectAnalysis, params.genre, params.variantIndex ?? 0);
    return composeStudioPrompt(direction, params.stageName);
  }
  return buildStudioPhotoFallback(params);
}

export function buildPortraitPrompt(params: ImagePromptParams): string {
  if (params.subjectAnalysis && params.genre) {
    const direction = buildCreativeDirection(params.subjectAnalysis, params.genre, params.variantIndex ?? 0);
    return composePortraitPrompt(direction, params.stageName);
  }
  return buildPortraitFallback(params);
}

export function buildArenaPhotoPrompt(params: ImagePromptParams): string {
  if (params.subjectAnalysis && params.genre) {
    const direction = buildCreativeDirection(params.subjectAnalysis, params.genre, params.variantIndex ?? 0);
    return composeArenaPrompt(direction, params.stageName);
  }
  return buildArenaPhotoFallback(params);
}

function buildStudioPhotoFallback({ stageName, genre, vibe }: ImagePromptParams): string {
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

function buildPortraitFallback({ stageName, genre, vibe }: ImagePromptParams): string {
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

function buildArenaPhotoFallback({ stageName, genre, vibe }: ImagePromptParams): string {
  const genreDirection = genre ? genreGenreDirection(genre) : "";
  const vibeDirection = vibe ? ` mood: ${vibe}` : "";

  return (
    `Ultra-realistic concert photograph of this exact same person performing live in a massive sold-out arena stadium — ` +
    `DO NOT alter face shape, facial features, skin tone, or body structure. ` +
    `The person must be visually identical to the reference photo. ` +
    `The artist is on a huge stage holding a microphone, singing passionately mid-song with mouth open, ` +
    `dynamic body movement, arms reaching toward a sea of tens of thousands of fans. ` +
    `The crowd has raised hands, glowing phone lights, and is going wild. ` +
    `Enormous LED screens, pyrotechnics, and dramatic concert lighting with laser beams cutting through volumetric haze. ` +
    `Shot from the photo pit with a 24mm wide-angle lens, f/2.8, capturing the epic scale of the venue. ` +
    `Intense spotlights, colored LED wash in blue and magenta, strobe effects, lens flare from stage lights, HDR. ` +
    `High-end concert photography${genreDirection}${vibeDirection}, ` +
    `photorealistic, ultra-detailed, 8k resolution, ` +
    `CRITICAL: preserve the exact facial features and physical appearance from the reference image, "${stageName}"`
  );
}

// Genre-specific visual direction tokens — fallback only, creative engine is primary
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
