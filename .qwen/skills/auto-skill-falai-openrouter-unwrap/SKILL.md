---
name: falai-openrouter-unwrap
description: fal.ai OpenRouter proxy returns nested JSON strings that need recursive unwrapping — pattern for extracting text content and structured responses, with Strategy pattern for name generation
source: auto-skill
extracted_at: '2026-07-08T08:41:48.139Z'
---

## fal.ai OpenRouter Response Unwrapping

When using `fal.subscribe("openrouter/router/vision", ...)` (or similar fal.ai OpenRouter endpoints), the response's `output` field is often a **JSON string**, not parsed JSON. Worse, it can be **nested** — the outer object wraps an inner JSON string that itself wraps the actual content.

### The Problem

A typical response looks like:
```json
{
  "output": "{\"name\":\"Amir Vetro\",\"reason\":\"...\"}",
  "usage": { "prompt_tokens": 624, ... }
}
```

But sometimes it's double-wrapped:
```json
{
  "data": {
    "output": "This man has an oval face with medium olive skin tone..."
  }
}
```

Or the `output` itself is a stringified JSON containing another `output` field. Naively reading `result.output` gives you a raw JSON string instead of the actual text, which pollutes downstream prompts.

### The Fix: Depth-Limited Recursive Unwrap + Clean Extraction

```typescript
const MAX_UNWRAP_DEPTH = 10;

function unwrapJsonString(raw: string, depth = 0): string {
  if (depth >= MAX_UNWRAP_DEPTH) return raw;

  try {
    let parsed: unknown = JSON.parse(raw);

    while (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); }
      catch { break; }
    }

    if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.output === "string") return unwrapJsonString(obj.output, depth + 1);
      if (obj.data && typeof obj.data === "object" && (obj.data as Record<string, unknown>).output) {
        return unwrapJsonString(String((obj.data as Record<string, unknown>).output), depth + 1);
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
```

**Key improvements over the basic version:**
- `MAX_UNWRAP_DEPTH = 10` prevents infinite recursion
- Typed with `Record<string, unknown>` instead of bare `any`
- Extracted `extractRawOutput` helper to separate response shape detection from content unwrapping

### Clean Response Extraction + Markdown Fence Stripping

```typescript
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

function stripMarkdownCodeFences(raw: string): string {
  return raw
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}
```

### Usage Pattern

```typescript
async function callOpenRouter(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  imageUrl?: string
): Promise<string> {
  const result = await fal.subscribe("openrouter/router/vision", {
    input: {
      prompt: userPrompt,
      model,
      system_prompt: systemPrompt,
      temperature: 0.85,
      max_tokens: 400,
      image_urls: imageUrl ? [imageUrl] : [],
    },
  });

  return unwrapJsonString(extractRawOutput(result));
}
```

### Strategy Pattern for Multiple Name Generation Calls

When you need to call the same endpoint with different models and angles, use the Strategy pattern:

```typescript
export interface NameGenerationStrategyConfig {
  model: string;
  creativeAngle: string;
  label: string;
}

export const NAME_GENERATION_STRATEGIES: NameGenerationStrategyConfig[] = [
  {
    model: "deepseek/deepseek-v4-flash",
    creativeAngle: "Linguistic creativity — wordplay, portmanteaus, phonetic impact",
    label: "DeepSeek (Linguistic)",
  },
  {
    model: "openai/gpt-5.5",
    creativeAngle: "Cultural depth — meaning, origin, identity resonance",
    label: "GPT-5.5 (Cultural)",
  },
  {
    model: "google/gemini-3-flash-preview",
    creativeAngle: "Marketability — memorability, SEO-friendliness, brand recall",
    label: "Gemini 3 (Market)",
  },
];

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
```

### Callers Then Parse the Unwrapped Result

For **text responses** (e.g., image analysis): the unwrapped string is directly usable as text.

For **structured JSON responses** (e.g., stage name generation where you asked for `{name, reason}`):
```typescript
const raw = await callOpenRouter(model, systemPrompt, userPrompt);
const cleaned = stripMarkdownCodeFences(raw);
const parsed = JSON.parse(cleaned) as { name?: string; reason?: string };
// parsed.name, parsed.reason are now correct
```

### Symptoms of Not Unwrapping

- Image generation prompts contain raw JSON like `{"data":{"output":"This man has..."}}` instead of the description text
- Stage name fields show fallback labels like "Name ModelName" instead of the generated name (because `parsed.name` is undefined when parsing fails on nested strings)
- No errors thrown — everything "works" but outputs are garbage

### Model Names on fal.ai OpenRouter

Not all OpenRouter models are available through fal.ai's proxy. Verified working (as of mid-2026):
- `google/gemini-2.5-flash` ✓
- `google/gemini-3-flash-preview` ✓
- `deepseek/deepseek-v4-flash` ✓
- `openai/gpt-5.5` ✓

Known to fail: `anthropic/claude-3.5-sonnet` (returns "No endpoints found"). Always test model availability before building pipelines around them.
