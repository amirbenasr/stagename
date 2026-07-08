import type { BrandKitData, AvailabilityReport } from "../types";
import { analyzeSelfieImage, generateAllStageNames } from "../ai/openrouter-client";
import { imageGenerationProvider } from "../ai/image-provider";
import { persistAllImages } from "./storage-service";
import { simulateAvailability } from "../utils/availability";
import { generateSlug } from "../utils/text-utils";
import { submissionRepository } from "../repositories/submission-repository";
import { brandKitRepository } from "../repositories/brand-kit-repository";
import { sendBrandKitReadyEmail } from "../email";

// ============================================================
// Generation Service — Pipeline Orchestrator
// ============================================================

export interface GenerationPipelineInput {
  submissionId: string;
}

interface GenerationPipelineContext {
  submissionId: string;
  email: string | null;
  selfieUrl: string;
  artistContext: string;
}

export async function executeGenerationPipeline(input: GenerationPipelineInput): Promise<BrandKitData> {
  const { submissionId } = input;

  // Step 0: Fetch submission
  const submission = await submissionRepository.findById(submissionId);
  if (!submission) {
    throw new SubmissionNotFoundError(submissionId);
  }

  const { answers, selfieUrl, email } = submission;
  const artistContext = buildArtistContextFromAnswers(answers);
  const ctx: GenerationPipelineContext = { submissionId, email, selfieUrl, artistContext };

  // Step 1: Image Analysis (non-fatal)
  const imageAnalysis = await analyzeImageStep(ctx);

  // Step 2: Generate 3 Stage Names (parallel via Strategy pattern)
  const stageNames = await generateStageNamesStep(ctx, imageAnalysis);

  // Step 3: Generate all 3 images (parallel via Factory pattern)
  const bestName = stageNames[0].name;
  const generatedImages = await imageGenerationProvider.generateAll(bestName, selfieUrl);

  console.log("Raw image URLs from fal.ai:", {
    logo: generatedImages.logo.url,
    studio: generatedImages.studio.url,
    portrait: generatedImages.portrait.url,
  });

  // Step 4: Persist images to Firebase Storage
  const persistedImages = await persistAllImages(generatedImages, submissionId);

  // Step 5: Simulate Platform Availability
  const availability = simulateAvailabilityForAll(stageNames);

  // Step 6: Save Brand Kit to Firestore
  const slug = generateSlug();
  await brandKitRepository.save({
    submissionId,
    slug,
    stageNames,
    portraitImageUrl: persistedImages.portrait,
    logoImageUrl: persistedImages.logo,
    studioPhotoUrl: persistedImages.studio,
    availability,
  });

  await submissionRepository.update(submissionId, {
    status: "complete",
    brandKitSlug: slug,
  });

  // Step 7: Send email (non-fatal)
  if (email) {
    try {
      await sendBrandKitReadyEmail(email, slug);
    } catch (err) {
      console.error("Failed to send brand kit ready email:", err);
    }
  }

  return {
    submissionId,
    slug,
    stageNames,
    portraitImageUrl: persistedImages.portrait,
    logoImageUrl: persistedImages.logo,
    studioPhotoUrl: persistedImages.studio,
    availability,
    status: "complete",
    createdAt: new Date().toISOString(),
  };
}

// ============================================================
// Pipeline Steps
// ============================================================

function buildArtistContextFromAnswers(answers: Record<string, string | string[]>): string {
  return Object.entries(answers)
    .filter(([, value]) => value && (typeof value === "string" ? value.trim() : value.length > 0))
    .map(([key, value]) => {
      const formatted = Array.isArray(value) ? value.join(", ") : value;
      return `${formatKey(key)}: ${formatted}`;
    })
    .join("\n");
}

function formatKey(key: string): string {
  const labels: Record<string, string> = {
    artistName: "Artist goes by",
    genre: "Music genre",
    origin: "From",
    platforms: "Platforms",
    vibe: "Vibe/Energy",
    persona: "On-stage persona",
    drive: "Artistic drive",
    visualWorld: "Visual world",
    languages: "Languages",
  };
  return labels[key] ?? key;
}

async function analyzeImageStep(ctx: GenerationPipelineContext): Promise<string> {
  if (!ctx.selfieUrl) return "";

  try {
    return await analyzeSelfieImage(ctx.selfieUrl);
  } catch (err) {
    console.error("Image analysis failed, continuing without it:", err);
    return "";
  }
}

async function generateStageNamesStep(
  ctx: GenerationPipelineContext,
  imageAnalysis: string
) {
  return generateAllStageNames(ctx.artistContext, imageAnalysis);
}

function simulateAvailabilityForAll(stageNames: { name: string }[]): AvailabilityReport {
  const availability: AvailabilityReport = {};
  for (const sn of stageNames) {
    availability[sn.name] = simulateAvailability(sn.name);
  }
  return availability;
}

// ============================================================
// Error Types
// ============================================================

export class SubmissionNotFoundError extends Error {
  constructor(submissionId: string) {
    super(`Submission not found: ${submissionId}`);
    this.name = "SubmissionNotFoundError";
  }
}