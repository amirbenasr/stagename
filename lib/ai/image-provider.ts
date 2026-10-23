import type { ImageGenerationRequest, ImageGenerationResult, ImageGenerationType } from "../types";
import { fal } from "./fal";
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

interface FalImageResult {
  data?: { images?: Array<{ url?: string }> };
  images?: Array<{ url?: string }>;
}

function extractImageUrl(result: unknown): string {
  const falResult = result as FalImageResult;
  return (
    falResult?.data?.images?.[0]?.url ??
    falResult?.images?.[0]?.url ??
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

/**
 * Escape hatch for one-off compositions (e.g. the First Take performance
 * frame) that don't belong to the logo/studio/portrait/arena presets.
 */
export async function generateImageFromPrompt(input: {
  endpoint: string;
  prompt: string;
  imageUrls?: string[];
  extraInput?: Record<string, unknown>;
}): Promise<{ url: string }> {
  const result = await fal.subscribe(input.endpoint, {
    input: {
      prompt: input.prompt,
      ...(input.imageUrls?.length ? { image_urls: input.imageUrls } : {}),
      ...input.extraInput,
    },
  });

  return { url: extractImageUrl(result) };
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
};
