import { fal } from "@fal-ai/client";
import type { NameGenerationStrategyConfig, StageNameResult } from "../types";
import { buildNameSystemPrompt, buildNameUserPrompt } from "./prompt-builders";
import { buildPodcastSystemPrompt, buildPodcastUserPrompt } from "./podcast-prompts";
import type { PodcastContext, PodcastSegment } from "./podcast-prompts";

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
      "Linguistic alchemist — you specialize in phonetic transformations of real names and cultural words. " +
      "You find hidden syllables, anagrams, and letter patterns within the artist's real name and heritage language, " +
      "then recombine them into something short, punchy, and sonically iconic. " +
      "Think: how would a linguist remix this name into 1-2 syllables that sound like music themselves?",
    label: "DeepSeek (Linguistic)",
  },
  {
    model: "openai/gpt-5.5",
    creativeAngle:
      "Cultural archaeologist — you dig deep into the artist's heritage to find a word, concept, or term " +
      "that carries profound meaning in their culture (like a word for a traditional art form, a historical concept, " +
      "a term from their dialect). Then you transform it into a globally pronounceable stage name. " +
      "The name must have a story — when the artist explains its origin, people should feel something.",
    label: "GPT-5.5 (Cultural)",
  },
  {
    model: "google/gemini-3-flash-preview",
    creativeAngle:
      "Brand visionary — you think about the name as a complete visual and commercial identity. " +
      "How does it look as a logo? Can it become a visual motif on merch, stage design, music videos? " +
      "Is it short enough to be iconic, unique enough to own completely, memorable enough to spread by word of mouth? " +
      "You prioritize names with strong visual branding potential — where the word itself suggests a creative universe.",
    label: "Gemini 3 (Market)",
  },
];

export async function generateStageName(
  strategy: NameGenerationStrategyConfig,
  artistContext: string,
  imageAnalysis: string,
  realName: string,
  culturePreference: string
): Promise<StageNameResult> {
  try {
    const raw = await callOpenRouter(
      strategy.model,
      buildNameSystemPrompt(strategy.creativeAngle, realName, culturePreference),
      buildNameUserPrompt(artistContext, imageAnalysis, realName, culturePreference)
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
  imageAnalysis: string,
  realName: string,
  culturePreference: string
): Promise<StageNameResult[]> {
  return Promise.all(
    NAME_GENERATION_STRATEGIES.map((strategy) =>
      generateStageName(strategy, artistContext, imageAnalysis, realName, culturePreference)
    )
  );
}

// ============================================================
// Image Analysis
// ============================================================

import type { SubjectAnalysis } from "./creative-engine/types";

export async function analyzeSelfieImage(
  selfieUrl: string
): Promise<SubjectAnalysis | null> {
  const { buildImageAnalysisSystemPrompt, buildImageAnalysisUserPrompt } = await import("./prompt-builders");
  const output = await callOpenRouter(
    "google/gemini-2.5-flash",
    buildImageAnalysisSystemPrompt(),
    buildImageAnalysisUserPrompt(),
    selfieUrl
  );

  try {
    const cleaned = output.trim().replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
    const parsed = JSON.parse(cleaned);
    return parsed as SubjectAnalysis;
  } catch {
    console.error("Failed to parse image analysis JSON:", output.slice(0, 200));
    return null;
  }
}

export function subjectAnalysisToText(analysis: SubjectAnalysis): string {
  const { face, body, vibe } = analysis;
  return [
    `Face: ${face.shape} shape, ${face.jaw} jaw, ${face.skinTone} skin with ${face.undertone} undertone`,
    `Hair: ${face.hair}`,
    face.facialHair ? `Facial hair: ${face.facialHair}` : null,
    `Build: ${body.build}, ${body.shoulders} shoulders, ${body.height} height`,
    `Vibe: confidence ${vibe.confidence}/1, ${vibe.expression}, appears ${vibe.perceivedAge} years old`,
  ].filter(Boolean).join(". ");
}

// ============================================================
// Podcast Script Generation
// ============================================================

export async function generatePodcastScript(
  ctx: PodcastContext
): Promise<PodcastSegment[]> {
  const output = await callOpenRouter(
    "google/gemini-3-flash-preview",
    buildPodcastSystemPrompt(),
    buildPodcastUserPrompt(ctx),
  );

  const cleaned = output.trim().replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  const parsed = JSON.parse(cleaned);

  const segments = Array.isArray(parsed) ? parsed : parsed.segments;
  if (!Array.isArray(segments) || segments.length === 0) {
    throw new Error("Invalid podcast script format");
  }

  return segments as PodcastSegment[];
}

// ============================================================
// Interview Script Generation — Breakfast Club Style (short)
// ============================================================

export interface InterviewScriptContext {
  stageName: string;
  genre: string;
  vibe: string;
}

const INTERVIEW_SYSTEM_PROMPT = `You are Charlamagne tha God from The Breakfast Club radio show. You are interviewing a brand-new artist for the very first time. Write a VERY short interview exchange — exactly 4 lines total:

1. HOST (Charlamagne): An opening question — hype but real, specific to this artist
2. ARTIST: A short, confident response (1 sentence max)
3. HOST: A follow-up reaction or second question
4. ARTIST: A closing line (1 sentence max)

RULES:
- Charlamagne speaks in his real voice: direct, no-nonsense, but supportive of new talent
- The artist is cool, humble, confident
- Reference the artist's genre and vibe specifically
- Keep it SHORT — this is a 15-second video clip
- No stage directions, no emojis, no markdown
- Return ONLY a JSON array

OUTPUT FORMAT:
[
  {"speaker": "host", "text": "..."},
  {"speaker": "artist", "text": "..."},
  {"speaker": "host", "text": "..."},
  {"speaker": "artist", "text": "..."}
]

Return ONLY the JSON array, no explanation.`;

function buildInterviewUserPrompt(ctx: InterviewScriptContext): string {
  return `Write a 4-line Breakfast Club interview for this artist:\n- Stage name: ${ctx.stageName}\n- Genre: ${ctx.genre}\n- Vibe: ${ctx.vibe}`;
}

export async function generateInterviewScript(
  ctx: InterviewScriptContext
): Promise<import("../types").InterviewLine[]> {
  const output = await callOpenRouter(
    "google/gemini-3-flash-preview",
    INTERVIEW_SYSTEM_PROMPT,
    buildInterviewUserPrompt(ctx),
  );

  const cleaned = output.trim().replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  const parsed = JSON.parse(cleaned);

  const lines = Array.isArray(parsed) ? parsed : parsed.lines;
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("Invalid interview script format");
  }

  return lines as import("../types").InterviewLine[];
}
