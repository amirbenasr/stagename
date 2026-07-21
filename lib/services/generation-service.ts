import type { BrandKitData, NameAssetSet } from "../types";
import type { SubjectAnalysis } from "../ai/creative-engine/types";
import { analyzeSelfieImage, generateAllStageNames, subjectAnalysisToText } from "../ai/openrouter-client";
import { imageGenerationProvider } from "../ai/image-provider";
import { persistAllImagesForName } from "./storage-service";
import { checkAvailability } from "../utils/availability";
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
  genre: string;
  vibe: string;
  realName: string;
  culturePreference: string;
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
  const genre = (answers.genre as string) || "";
  const vibe = (answers.vibe as string) || "";
  const realName = (answers.realName as string) || "";
  const culturePreference = (answers.culturePreference as string) || "";
  const ctx: GenerationPipelineContext = { submissionId, email, selfieUrl, artistContext, genre, vibe, realName, culturePreference };

  // Step 1: Image Analysis — structured JSON (non-fatal)
  const subjectAnalysis = await analyzeImageStep(ctx);
  const imageAnalysisText = subjectAnalysis ? subjectAnalysisToText(subjectAnalysis) : "";

  // Step 2: Generate 3 Stage Names (parallel via Strategy pattern)
  const stageNames = await generateStageNamesStep(ctx, imageAnalysisText);

  // Step 3: Generate images for ALL 3 names in parallel
  const nameAssetSets = await generateAllNameAssets(stageNames, selfieUrl, submissionId, genre, vibe, subjectAnalysis);

  // Step 4: Save Brand Kit to Firestore
  const slug = generateSlug();
  await brandKitRepository.save({
    submissionId,
    slug,
    names: nameAssetSets,
    genre,
    vibe,
  });

  await submissionRepository.update(submissionId, {
    status: "complete",
    brandKitSlug: slug,
  });

  // Step 5: Send email (non-fatal)
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
    names: nameAssetSets,
    genre,
    vibe,
    status: "complete",
    createdAt: new Date().toISOString(),
  };
}

async function generateAllNameAssets(
  stageNames: { name: string; reason: string; model: string }[],
  selfieUrl: string,
  submissionId: string,
  genre: string,
  vibe: string,
  subjectAnalysis: SubjectAnalysis | null
): Promise<NameAssetSet[]> {
  // Generate all 9 images in parallel (3 names × 3 image types)
  const imageResults = await Promise.all(
    stageNames.map(async (sn) => {
      const images = await imageGenerationProvider.generateAll(sn.name, selfieUrl, { genre, vibe, subjectAnalysis: subjectAnalysis ?? undefined });
      return { name: sn.name, images };
    })
  );

  // Persist all images to Firebase Storage with per-name filenames
  const persistResults = await Promise.all(
    imageResults.map(async ({ name, images }) => {
      const persisted = await persistAllImagesForName(images, submissionId, name);
      return { name, persisted };
    })
  );

  // Build NameAssetSet array with per-name assets + availability
  return Promise.all(stageNames.map(async (sn) => {
    const persisted = persistResults.find((r) => r.name === sn.name)!.persisted;
    return {
      name: sn.name,
      reason: sn.reason,
      model: sn.model,
      portraitImageUrl: persisted.portrait,
      logoImageUrl: persisted.logo,
      studioPhotoUrl: persisted.studio,
      availability: await checkAvailability(sn.name),
    };
  }));
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
    realName: "Real name",
    culturePreference: "Culture preference",
    genre: "Music genre",
    influences: "Musical influences",
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

async function analyzeImageStep(ctx: GenerationPipelineContext): Promise<SubjectAnalysis | null> {
  if (!ctx.selfieUrl) return null;

  try {
    return await analyzeSelfieImage(ctx.selfieUrl);
  } catch (err) {
    console.error("Image analysis failed, continuing without it:", err);
    return null;
  }
}

async function generateStageNamesStep(
  ctx: GenerationPipelineContext,
  imageAnalysis: string
) {
  return generateAllStageNames(ctx.artistContext, imageAnalysis, ctx.realName, ctx.culturePreference);
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