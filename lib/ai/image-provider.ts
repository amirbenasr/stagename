import { fal } from "@fal-ai/client";
import type { ImageGenerationRequest, ImageGenerationResult, ImageGenerationType } from "../types";
import type { SubjectAnalysis } from "./creative-engine/types";
import {
  buildLogoPrompt,
  buildPortraitPrompt,
  buildStudioPhotoPrompt,
  buildArenaPhotoPrompt,
  type ImagePromptParams,
} from "./prompt-builders";

// ============================================================
// Image Generation Provider — Factory Pattern
// ============================================================

fal.config({
  credentials: process.env.FAL_KEY!,
});

interface FalImageResult {
  data?: { images?: Array<{ url?: string }> };
  images?: Array<{ url?: string }>;
}

interface FalVideoResult {
  data?: { video?: { url?: string } };
  video?: { url?: string };
  output?: Array<{ url?: string }>;
}

function extractImageUrl(result: unknown): string {
  const falResult = result as FalImageResult;
  return (
    falResult?.data?.images?.[0]?.url ??
    falResult?.images?.[0]?.url ??
    ""
  );
}

function extractVideoUrl(result: unknown): string {
  const falResult = result as FalVideoResult;
  return (
    falResult?.data?.video?.url ??
    falResult?.video?.url ??
    falResult?.output?.[0]?.url ??
    ""
  );
}

type EndpointConfig = {
  endpoint: string;
  selfieRefRequired: boolean;
  promptBuilder: (params: ImagePromptParams) => string;
  extraInput?: Record<string, unknown>;
};

const ENDPOINT_CONFIG: Record<ImageGenerationType, EndpointConfig> = {
  logo: {
    endpoint: "fal-ai/flux-pro/v1.1",
    selfieRefRequired: false,
    promptBuilder: (p: ImagePromptParams) => buildLogoPrompt(p.stageName, p.genre),
    extraInput: { image_size: "square_hd" },
  },
  studio: {
    endpoint: "bytedance/seedream/v5/pro/edit",
    selfieRefRequired: true,
    promptBuilder: buildStudioPhotoPrompt,
  },
  portrait: {
    endpoint: "bytedance/seedream/v5/pro/edit",
    selfieRefRequired: true,
    promptBuilder: buildPortraitPrompt,
  },
  arena: {
    endpoint: "bytedance/seedream/v5/pro/edit",
    selfieRefRequired: true,
    promptBuilder: buildArenaPhotoPrompt,
  },
};

function buildFalInput(
  config: EndpointConfig,
  prompt: string,
  selfieUrl?: string
): Record<string, unknown> {
  const input: Record<string, unknown> = {
    prompt,
    ...config.extraInput,
  };

  if (config.selfieRefRequired && selfieUrl) {
    input.image_urls = [selfieUrl];
  }

  return input;
}

async function generateSingleImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const config = ENDPOINT_CONFIG[request.type];
  const prompt = request.prompt
    || (request.promptParams ? config.promptBuilder(request.promptParams) : undefined);

  if (!prompt) {
    throw new Error(`No prompt provided and no promptParams to build one for ${request.type}`);
  }

  const input = buildFalInput(config, prompt, request.selfieUrl);

  const result = await fal.subscribe(config.endpoint, { input });

  return {
    url: extractImageUrl(result),
    type: request.type,
  };
}

function buildImageRequest(
  type: ImageGenerationType,
  params: ImagePromptParams,
  selfieUrl?: string
): ImageGenerationRequest {
  const config = ENDPOINT_CONFIG[type];

  return {
    type,
    prompt: config.promptBuilder(params),
    selfieUrl: config.selfieRefRequired ? selfieUrl : undefined,
    promptParams: params,
  };
}

export interface ImageGenerationParams {
  genre?: string;
  vibe?: string;
  subjectAnalysis?: SubjectAnalysis;
  variantIndex?: number;
}

const BREAKFAST_CLUB_STUDIO_URL =
  "https://firebasestorage.googleapis.com/v0/b/stagenameclub.firebasestorage.app/o/references%2FbKM8sIIpc_cpN6c9k66wp_rjE7iROS.jpg?alt=media&token=341d9eac-be69-4760-97b2-e62a4a85031d";

function buildVideoPrompt(
  stageName: string,
  genre: string,
  vibe: string
): string {
  const genreModifier = genre
    ? `${genre} artist aesthetic`
    : "music artist aesthetic";

  const vibeModifier = vibe
    ? `${vibe} energy`
    : "confident energy";

  return `
Reference Subject: @Image1
Reference Environment: @Image2

Create a 10-second ultra-realistic cinematic interview video featuring the person from @Image1 as "${stageName}", a ${genreModifier} with ${vibeModifier}.

The environment must match @Image2 exactly. Recreate The Breakfast Club radio studio with its iconic backdrop, neon signage, professional broadcast microphones, mixing desk, warm studio lighting, and authentic podcast atmosphere. Maintain the same framing, lighting direction, camera angle, and production quality as the reference image.

${stageName} is seated comfortably as a guest wearing premium black over-ear studio headphones, dressed in a stylish all-black outfit with subtle luxury accessories. The artist leans slightly toward the suspended broadcast microphone while maintaining relaxed, confident body language.

Facial animation should be highly realistic with natural blinking, subtle eye movement, gentle head nods, expressive eyebrows, realistic breathing, and perfectly synchronized lip movements. Include small conversational hand gestures and natural posture adjustments throughout the scene.

Camera:
- Medium close-up
- 85mm cinematic lens
- Shallow depth of field
- Soft background bokeh
- Smooth handheld micro-movements
- Professional podcast framing

Lighting:
- Warm broadcast lighting
- Soft cinematic key light
- Subtle rim light
- HDR
- Realistic skin texture
- Film-quality color grading

Mood:
Dark, mysterious, charismatic, premium, authentic, confident.

Dialogue (perfect lip sync):

Host (off-camera):
"${stageName}, people say your sound doesn't follow trends. Where does that energy come from?"

${stageName}:
"I never make music to fit in. Every record comes from real life, real emotions, and real experiences. If people connect with it, that's because they feel the truth behind every beat."

Audio:
- Host voice comes naturally from off-camera.
- ${stageName}'s voice is calm, confident, and expressive.
- Professional radio interview audio.
- Subtle studio ambience.
- low volume background music.

Style:
Ultra-photorealistic, cinematic documentary realism, natural human motion, realistic lip sync, premium podcast aesthetic, 4K, high detail, film quality.
`.trim();
}

export interface VideoGenerationResult {
  url: string;
}

async function generateVideo(
  portraitUrl: string,
  stageName: string,
  genre: string,
  vibe: string
): Promise<VideoGenerationResult> {
  const prompt = buildVideoPrompt(stageName, genre, vibe);

  const result = await fal.subscribe("xai/grok-imagine-video/reference-to-video", {
    input: {
      prompt: `${prompt} @Image1`,
      reference_image_urls: [portraitUrl, BREAKFAST_CLUB_STUDIO_URL],
      duration: 10,
      aspect_ratio: "16:9",
      resolution: "720p",
    },
  });

  return {
    url: extractVideoUrl(result),
  };
}

export const imageGenerationProvider = {
  async generateLogo(stageName: string, params?: ImageGenerationParams): Promise<ImageGenerationResult> {
    return generateSingleImage(buildImageRequest("logo", { stageName, ...params }));
  },

  async generateStudioPhoto(
    stageName: string,
    selfieUrl: string,
    params?: ImageGenerationParams
  ): Promise<ImageGenerationResult> {
    return generateSingleImage(buildImageRequest("studio", { stageName, ...params }, selfieUrl));
  },

  async generatePortrait(
    stageName: string,
    selfieUrl: string,
    params?: ImageGenerationParams
  ): Promise<ImageGenerationResult> {
    return generateSingleImage(buildImageRequest("portrait", { stageName, ...params }, selfieUrl));
  },

  async generateArenaPhoto(
    stageName: string,
    selfieUrl: string,
    params?: ImageGenerationParams
  ): Promise<ImageGenerationResult> {
    return generateSingleImage(buildImageRequest("arena", { stageName, ...params }, selfieUrl));
  },

  async generateAll(
    stageName: string,
    selfieUrl: string,
    params?: ImageGenerationParams
  ): Promise<{
    logo: ImageGenerationResult;
    studio: ImageGenerationResult;
    portrait: ImageGenerationResult;
    arena: ImageGenerationResult;
  }> {
    const [logo, studio, portrait, arena] = await Promise.all([
      this.generateLogo(stageName, params),
      this.generateStudioPhoto(stageName, selfieUrl, params),
      this.generatePortrait(stageName, selfieUrl, params),
      this.generateArenaPhoto(stageName, selfieUrl, params),
    ]);

    return { logo, studio, portrait, arena };
  },

  async generateInterviewVideo(
    portraitUrl: string,
    stageName: string,
    genre: string,
    vibe: string
  ): Promise<VideoGenerationResult> {
    return generateVideo(portraitUrl, stageName, genre, vibe);
  },
};
