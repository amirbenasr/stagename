import { fal } from "@fal-ai/client";
import type { ImageGenerationRequest, ImageGenerationResult, ImageGenerationType } from "../types";
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
    endpoint: "fal-ai/flux-2-pro/edit",
    selfieRefRequired: true,
    promptBuilder: buildStudioPhotoPrompt,
  },
  portrait: {
    endpoint: "fal-ai/flux-2-pro/edit",
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

export interface GenreVibeParams {
  genre?: string;
  vibe?: string;
}

export const imageGenerationProvider = {
  async generateLogo(stageName: string, params?: GenreVibeParams): Promise<ImageGenerationResult> {
    return generateSingleImage(buildImageRequest("logo", { stageName, ...params }));
  },

  async generateStudioPhoto(
    stageName: string,
    selfieUrl: string,
    params?: GenreVibeParams
  ): Promise<ImageGenerationResult> {
    return generateSingleImage(buildImageRequest("studio", { stageName, ...params }, selfieUrl));
  },

  async generatePortrait(
    stageName: string,
    selfieUrl: string,
    params?: GenreVibeParams
  ): Promise<ImageGenerationResult> {
    return generateSingleImage(buildImageRequest("portrait", { stageName, ...params }, selfieUrl));
  },

  async generateAll(
    stageName: string,
    selfieUrl: string,
    params?: GenreVibeParams
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
};
