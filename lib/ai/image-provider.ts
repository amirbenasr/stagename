import { fal } from "@fal-ai/client";
import type { ImageGenerationRequest, ImageGenerationResult, ImageGenerationType } from "../types";
import type { SubjectAnalysis } from "./creative-engine/types";
import {
  buildLogoPrompt,
  buildPortraitPrompt,
  buildStudioPhotoPrompt,
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
  "https://firebasestorage.googleapis.com/v0/b/stagenameclub.firebasestorage.app/o/references%2F23breakfastclub1-videoSixteenByNine3000.jpg?alt=media&token=fc2f22e0-269c-41cd-9d12-8521d6550701";

function buildVideoPrompt(stageName: string, genre: string, vibe: string): string {
  const genreModifier = genre
    ? `, ${genre} artist aesthetic`
    : "";
  const vibeModifier = vibe
    ? `, ${vibe} energy`
    : "";

  return (
    `A ${stageName}${genreModifier}${vibeModifier} sitting as a guest on The Breakfast Club radio show, ` +
    `wearing large over-ear headphones, leaning slightly forward toward a broadcast microphone on a boom arm. ` +
    `The setting must match @Image2 exactly — the same Breakfast Club radio studio with its iconic backdrop, ` +
    `neon signage, and warm broadcast lighting. ` +
    `The artist has a natural, engaged expression as if mid-conversation during a live radio interview. ` +
    `Cinematic shallow depth of field, realistic photography style.`
  );
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

  async generateAll(
    stageName: string,
    selfieUrl: string,
    params?: ImageGenerationParams
  ): Promise<{
    logo: ImageGenerationResult;
    studio: ImageGenerationResult;
    portrait: ImageGenerationResult;
  }> {
    const [logo, studio, portrait] = await Promise.all([
      this.generateLogo(stageName, params),
      this.generateStudioPhoto(stageName, selfieUrl, params),
      this.generatePortrait(stageName, selfieUrl, params),
    ]);

    return { logo, studio, portrait };
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
