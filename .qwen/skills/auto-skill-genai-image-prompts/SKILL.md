---
name: genai-image-prompts
description: Cinematic AI image generation prompt patterns for artist brand kits — Hollywood camera/lighting tokens, genre-vibe matching, face preservation directives, and pipeline architecture (project)
source: auto-skill
extracted_at: '2026-07-09T18:49:25.783Z'
---

## Cinematic AI Image Generation for Artist Brand Kits

### Problem
Default AI image prompts produce generic, flat results that don't match Hollywood studio quality. AI models also tend to alter the subject's face when given a reference selfie, and ignore the artist's musical genre/vibe.

### Solution: Three-Layer Prompt Architecture

#### Layer 1 — Camera & Lens Tokens (always present)
Every professional photo prompt MUST include:
- **Camera**: `Shot on ARRI Alexa 65`
- **Lens**: `85mm lens` (standard for portraits/headshots)
- **Aperture**: `f/2.8` (studio, shallow DOF) or `f/1.8` (portrait, tighter bokeh)
- **Framing**: `shallow depth of field`, `tight head-and-shoulders framing` (portrait)
- **Lighting**: `three-point studio lighting with soft key light and subtle rim light` (studio) or `Rembrandt lighting with subtle fill light` (portrait)
- **Quality**: `photorealistic, ultra-detailed, 8k resolution, color graded`

#### Layer 2 — Face Preservation Directives (critical for consistency)
Place BOTH at the beginning AND end of the prompt:
- Opening: `Hollywood studio photograph of this exact same person — DO NOT alter face shape, facial features, skin tone, or body structure. The person must be visually identical to the reference photo.`
- Closing: `CRITICAL: preserve the exact facial features and physical appearance from the reference image`

#### Layer 3 — Genre-Specific Visual Direction (genre match)
Each music genre gets unique color grading, lighting, and aesthetic tokens appended to the prompt:

| Genre | Visual Tokens |
|-------|--------------|
| Hip-Hop | urban street aesthetic, gold chain accents, warm amber and deep purple color grading, hip-hop magazine editorial style |
| R&B | smooth velvet aesthetic, warm golden hour lighting, sensual moody atmosphere, rich purple and magenta tones, R&B album cover photography style |
| Pop | bright high-key lighting, vibrant saturated colors, clean polished commercial aesthetic, pop star magazine editorial |
| Electronic/EDM | neon-lit cyberpunk aesthetic, cool blue and electric pink lighting, futuristic club atmosphere |
| Rock/Indie | gritty analog film aesthetic, natural warm tones, raw edgy composition, vintage film grain texture |
| Afrobeats/Amapiano | vibrant warm golden lighting, rich earthy tones mixed with bright colors, confident African-inspired aesthetic |
| Latin/Reggaeton | warm tropical lighting, vibrant red and gold color palette, passionate energetic composition |
| Jazz/Soul | moody low-key lighting, warm amber and deep brown tones, intimate jazz club atmosphere, film noir aesthetic |
| Experimental | avant-garde artistic composition, unconventional lighting, abstract color grading |
| Country/Folk | natural warm golden hour lighting, rustic organic aesthetic, earthy tones, Americana folk photography style |

#### Layer 4 — Vibe/Mood (artist energy match)
Append the artist's selected vibe energy (e.g., "Chill & Dreamy", "Bold & Unapologetic") as ` mood: {vibe}`.

### Pipeline Architecture

```
Quiz Answers (genre, vibe)
  → generation-service extracts genre + vibe
    → imageGenerationProvider.generateAll(stageName, selfieUrl, { genre, vibe })
      → buildStudioPhotoPrompt/buildPortraitPrompt/buildLogoPrompt receive ImagePromptParams
        → genreGenreDirection(genre) returns genre-specific token string
        → Final prompt = base cinematic + genre tokens + vibe mood
          → fal.subscribe("fal-ai/flux-2-pro/edit", { input: { prompt, image_urls: [selfieUrl] } })
```

### Key Files
- `lib/ai/prompt-builders.ts` — Prompt construction with `ImagePromptParams` interface and `genreGenreDirection()` genre map
- `lib/ai/image-provider.ts` — Factory pattern, `generateAll()` accepts `GenreVibeParams`
- `lib/services/generation-service.ts` — Orchestrator, passes genre/vibe from quiz answers through pipeline
- `lib/types.ts` — `BrandKitData` includes `genre` and `vibe` fields for UI display

### Logo Generation — Sharp Text Rendering

**Problem**: `fal-ai/flux/dev` produces blurry logos with illegible text. AI image models struggle with text rendering.

**Solution**:
- Use `fal-ai/flux-pro` (higher quality) instead of `fal-ai/flux/dev`
- Set `image_size: "1536x1536"` via the `extraInput` config pattern for high-res output
- Prompt MUST emphasize text clarity: `The text "{name}" must be rendered in bold, crisp, perfectly legible letterforms — every letter sharp and clearly defined`
- Include: `Clean vector aesthetic, flat design with strong geometric shapes, pure white background, high contrast, ultra-sharp rendering, no blur, no artifacts, print-quality resolution`

**`extraInput` pattern** in `image-provider.ts` — endpoint-specific params merged into fal input:
```typescript
type EndpointConfig = {
  endpoint: string;
  selfieRefRequired: boolean;
  promptBuilder: (params: ImagePromptParams) => string;
  extraInput?: Record<string, unknown>;  // merged into fal.subscribe input
};
```

### fal.ai Model Notes
- **Portrait/Studio**: `fal-ai/flux-2-pro/edit` — uses `image_urls` array param (NOT `image_url`), NO `strength` param (causes 422)
- **Logo**: `fal-ai/flux-pro` — text-to-image, `image_size: "1536x1536"` for sharp text. No selfie reference needed
