// ============================================================
// Prompt Builders — Centralized AI prompt construction
// ============================================================

import type { SubjectAnalysis } from "./creative-engine/types";
import { buildCreativeDirection, composePortraitPrompt, composeStudioPrompt } from "./creative-engine";

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
    `You are a world-class Music Creative Director who crafts artist names the way a linguist crafts poetry.\n\n` +
    `YOUR METHODOLOGY — follow this creative process:\n` +
    `1. DEEP DIVE into the artist's real name ("${realName}") — analyze its syllables, phonetics, letter patterns, ` +
    `anagrams, hidden words, and cultural etymology. The real name is raw material, not a constraint.\n` +
    `2. EXPLORE the artist's cultural and linguistic roots — find a word, concept, or term from their heritage ` +
    `that has deep meaning (like "ZILIZ" = Carthaginian tiles in Tunisian dialect). This word should have ` +
    `PERSONAL RESONANCE with the artist's story, not just sound cool.\n` +
    `3. TRANSFORM through creative phonetic manipulation:\n` +
    `   - Syllable extraction and recombination\n` +
    `   - Anagrammatic rearrangement of name letters or cultural words\n` +
    `   - Phonetic spelling adjustments for global pronunciation\n` +
    `   - Creative respelling that looks iconic written down\n` +
    `   - Portmanteaus blending the real name with cultural terms\n` +
    `4. VALIDATE the result against these criteria:\n` +
    `   - SHORT: ideally 1-2 syllables, max 6-7 letters\n` +
    `   - MEMORABLE: has a phonetic hook — palindrome, symmetry, alliteration, or rhythmic quality\n` +
    `   - GLOBALLY PRONOUNCEABLE: works across languages and cultures\n` +
    `   - VISUALLY DISTINCTIVE: looks iconic as a logo, has interesting letter shapes\n` +
    `   - CREATIVE POTENTIAL: the word/concept can extend into visual branding ` +
    `(merch patterns, music video motifs, stage design — like Carthaginian tiles becoming a visual language)\n` +
    `   - UNIQUE: not an existing artist name, not a common word in English\n\n` +
    `CULTURE DIRECTION: ${cultureGuidance}\n\n` +
    `YOUR CREATIVE ANGLE: ${creativeAngle}\n\n` +
    `STRICT RULES:\n` +
    `- Do NOT just mash up syllables from the real name randomly — find MEANINGFUL connections\n` +
    `- Do NOT generate generic "cool-sounding" names — every name must have a story\n` +
    `- Do NOT include the full real name — transform it beyond recognition\n` +
    `- The name doesn't have to include any part of the real name — be creative\n` +
    `- Avoid cultural appropriation; ensure authenticity and respect\n` +
    `- Two other creative directors are generating names for this same artist. ` +
    `You MUST explore a completely different naming direction — avoid obvious choices.\n\n` +
    `You MUST respond ONLY with valid JSON — no markdown, no extra text:\n` +
    `{ "name": "stage name", "reason": "2-3 sentences: the cultural/linguistic origin of the word, ` +
    `why it fits THIS artist, and its visual/branding potential" }`
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
