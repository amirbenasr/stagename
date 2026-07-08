import { fal } from "@fal-ai/client";
import type { ImageGenerationRequest, ImageGenerationResult, ImageGenerationType } from "../types";
import {
  buildLogoPrompt,
  buildPortraitPrompt,
  buildStudioPhotoPrompt,
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
  promptBuilder: (stageName: string) => string;
};

const ENDPOINT_CONFIG: Record<ImageGenerationType, EndpointConfig> = {
  logo: {
    endpoint: "fal-ai/flux/dev",
    selfieRefRequired: false,
    promptBuilder: buildLogoPrompt,
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
  const input: Record<string, unknown> = { prompt };

  if (config.selfieRefRequired && selfieUrl) {
    input.image_urls = [selfieUrl];
  }

  return input;
}

async function generateSingleImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const config = ENDPOINT_CONFIG[request.type];
  const prompt = request.prompt || config.promptBuilder(request.prompt);

  const input = buildFalInput(config, prompt, request.selfieUrl);

  const result = await fal.subscribe(config.endpoint, { input });

  return {
    url: extractImageUrl(result),
    type: request.type,
  };
}

function buildImageRequest(
  type: ImageGenerationType,
  stageName: string,
  selfieUrl?: string
): ImageGenerationRequest {
  const config = ENDPOINT_CONFIG[type];

  return {
    type,
    prompt: config.promptBuilder(stageName),
    selfieUrl: config.selfieRefRequired ? selfieUrl : undefined,
  };
}

export const imageGenerationProvider = {
  async generateLogo(stageName: string): Promise<ImageGenerationResult> {
    return generateSingleImage(buildImageRequest("logo", stageName));
  },

  async generateStudioPhoto(
    stageName: string,
    selfieUrl: string
  ): Promise<ImageGenerationResult> {
    return generateSingleImage(buildImageRequest("studio", stageName, selfieUrl));
  },

  async generatePortrait(
    stageName: string,
    selfieUrl: string
  ): Promise<ImageGenerationResult> {
    return generateSingleImage(buildImageRequest("portrait", stageName, selfieUrl));
  },

  async generateAll(
    stageName: string,
    selfieUrl: string
  ): Promise<{
    logo: ImageGenerationResult;
    studio: ImageGenerationResult;
    portrait: ImageGenerationResult;
  }> {
    const [logo, studio, portrait] = await Promise.all([
      this.generateLogo(stageName),
      this.generateStudioPhoto(stageName, selfieUrl),
      this.generatePortrait(stageName, selfieUrl),
    ]);

    return { logo, studio, portrait };
  },
};
