import { fal } from "@fal-ai/client";
import type { NameGenerationStrategyConfig, StageNameResult } from "../types";
import { buildNameSystemPrompt, buildNameUserPrompt } from "./prompt-builders";

// ============================================================
// OpenRouter Client — Adapter for fal.ai's OpenRouter proxy
// ============================================================

fal.config({
  credentials: process.env.FAL_KEY!,
});

interface OpenRouterInput {
  prompt: string;
  model: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  image_urls: string[];
}

const DEFAULT_TEMPERATURE = 0.85;
const DEFAULT_MAX_TOKENS = 400;

function unwrapJsonString(raw: string, depth = 0): string {
  const MAX_UNWRAP_DEPTH = 10;
  if (depth >= MAX_UNWRAP_DEPTH) return raw;

  try {
    let parsed: unknown = JSON.parse(raw);

    while (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        break;
      }
    }

    if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;

      if (typeof obj.output === "string") return unwrapJsonString(obj.output, depth + 1);
      if (obj.data && typeof obj.data === "object") {
        const dataObj = obj.data as Record<string, unknown>;
        if (dataObj.output) return unwrapJsonString(String(dataObj.output), depth + 1);
      }
      if (typeof obj.content === "string") return obj.content;
      if (Array.isArray(obj.choices) && obj.choices[0]) {
        const choice = obj.choices[0] as Record<string, unknown>;
        const message = choice.message as Record<string, unknown> | undefined;
        if (message && typeof message.content === "string") return message.content;
      }

      return JSON.stringify(parsed);
    }

    return String(parsed);
  } catch {
    return raw;
  }
}

interface FalSubscribeResult {
  output?: string;
  choices?: Array<{ message?: { content?: string } }>;
  [key: string]: unknown;
}

function extractRawOutput(result: unknown): string {
  const falResult = result as FalSubscribeResult;
  const raw =
    falResult?.output ??
    falResult?.choices?.[0]?.message?.content ??
    JSON.stringify(result);

  return typeof raw === "string" ? raw : JSON.stringify(raw);
}

async function callOpenRouter(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  imageUrl?: string
): Promise<string> {
  const input: OpenRouterInput = {
    prompt: userPrompt,
    model,
    system_prompt: systemPrompt,
    temperature: DEFAULT_TEMPERATURE,
    max_tokens: DEFAULT_MAX_TOKENS,
    image_urls: imageUrl ? [imageUrl] : [],
  };

  const result = await fal.subscribe("openrouter/router/vision", { input });
  return unwrapJsonString(extractRawOutput(result));
}

function stripMarkdownCodeFences(raw: string): string {
  return raw
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

interface ParsedNameResponse {
  name?: string;
  reason?: string;
}

function parseNameResponse(raw: string): ParsedNameResponse {
  const cleaned = stripMarkdownCodeFences(raw);
  return JSON.parse(cleaned) as ParsedNameResponse;
}

function createFallbackResult(label: string, reason: string): StageNameResult {
  return {
    name: `Name ${label}`,
    reason,
    model: label,
  };
}

// ============================================================
// Name Generation — Strategy Pattern
// ============================================================

export const NAME_GENERATION_STRATEGIES: NameGenerationStrategyConfig[] = [
  {
    model: "deepseek/deepseek-v4-flash",
    creativeAngle:
      "Linguistic creativity — wordplay, portmanteaus, phonetic impact, unique letter combinations",
    label: "DeepSeek (Linguistic)",
  },
  {
    model: "openai/gpt-5.5",
    creativeAngle:
      "Cultural depth — meaning, origin, identity resonance, names that carry weight and story",
    label: "GPT-5.5 (Cultural)",
  },
  {
    model: "google/gemini-3-flash-preview",
    creativeAngle:
      "Marketability — memorability, SEO-friendliness, platform search uniqueness, brand recall",
    label: "Gemini 3 (Market)",
  },
];

export async function generateStageName(
  strategy: NameGenerationStrategyConfig,
  artistContext: string,
  imageAnalysis: string
): Promise<StageNameResult> {
  try {
    const raw = await callOpenRouter(
      strategy.model,
      buildNameSystemPrompt(strategy.creativeAngle),
      buildNameUserPrompt(artistContext, imageAnalysis)
    );

    const parsed = parseNameResponse(raw);

    return {
      name: parsed.name || `Name ${strategy.label}`,
      reason: parsed.reason || "AI-generated brand name",
      model: strategy.label,
    };
  } catch (err) {
    console.error(`Name generation failed for ${strategy.label}:`, err);
    return createFallbackResult(strategy.label, "Generation encountered an issue");
  }
}

export async function generateAllStageNames(
  artistContext: string,
  imageAnalysis: string
): Promise<StageNameResult[]> {
  return Promise.all(
    NAME_GENERATION_STRATEGIES.map((strategy) =>
      generateStageName(strategy, artistContext, imageAnalysis)
    )
  );
}

// ============================================================
// Image Analysis
// ============================================================

export async function analyzeSelfieImage(
  selfieUrl: string
): Promise<string> {
  const { buildImageAnalysisSystemPrompt, buildImageAnalysisUserPrompt } = await import("./prompt-builders");
  const output = await callOpenRouter(
    "google/gemini-2.5-flash",
    buildImageAnalysisSystemPrompt(),
    buildImageAnalysisUserPrompt(),
    selfieUrl
  );
  return output.trim();
}
