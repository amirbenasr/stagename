---
name: falai-openrouter-unwrap
description: fal.ai OpenRouter proxy returns nested JSON strings that need recursive unwrapping — pattern for extracting text content and structured responses
source: auto-skill
extracted_at: '2026-07-07T20:43:19.257Z'
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

Or the `output` itself is a stringified JSON containing another `output` field. Naively reading `result.output` gives you a raw JSON string instead of the actual text, which pollutes downstream prompts (e.g., injecting `{"data":{"output":"..."}}` into image generation prompts).

### The Fix: Recursive Unwrap

```typescript
function unwrapJsonString(raw: string): string {
  try {
    let parsed = JSON.parse(raw);
    // Recursively unwrap if the value is still a JSON string
    while (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); }
      catch { break; }
    }
    // Extract text content from known wrapper shapes
    if (parsed && typeof parsed === "object") {
      if (typeof parsed.output === "string") return unwrapJsonString(parsed.output);
      if (parsed.data?.output) return unwrapJsonString(parsed.data.output);
      if (typeof parsed.content === "string") return parsed.content;
      if (Array.isArray(parsed.choices) && parsed.choices[0]?.message?.content) {
        return parsed.choices[0].message.content;
      }
      // It's a real JSON object (like {name, reason}) — return stringified for caller to parse
      return JSON.stringify(parsed);
    }
    return String(parsed);
  } catch {
    return raw; // not valid JSON — return as-is
  }
}
```

### Usage Pattern

```typescript
async function callOpenRouter(model: string, systemPrompt: string, userPrompt: string, imageUrl?: string): Promise<string> {
  const result = await fal.subscribe("openrouter/router/vision", {
    input: {
      prompt: userPrompt,
      model,
      system_prompt: systemPrompt,
      temperature: 0.85,
      max_tokens: 400,
      image_urls: imageUrl ? [imageUrl] : [],
    } as any, // fal types may not match OpenRouter's schema
  });

  const raw =
    (result as any)?.output ??
    (result as any)?.choices?.[0]?.message?.content ??
    JSON.stringify(result);

  return typeof raw === "string" ? unwrapJsonString(raw) : unwrapJsonString(JSON.stringify(raw));
}
```

### Callers Then Parse the Unwrapped Result

For **text responses** (e.g., image analysis): the unwrapped string is directly usable as text.

For **structured JSON responses** (e.g., stage name generation where you asked for `{name, reason}`):
```typescript
const raw = await callOpenRouter(model, systemPrompt, userPrompt);
const cleaned = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
const parsed = JSON.parse(cleaned);
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
