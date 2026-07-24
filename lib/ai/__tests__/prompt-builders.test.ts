import { describe, it, expect } from "vitest";
import {
  buildStudioPhotoPrompt,
  buildPortraitPrompt,
  buildLogoPrompt,
  buildImageAnalysisSystemPrompt,
  type ImagePromptParams,
} from "../prompt-builders";
import type { SubjectAnalysis } from "../creative-engine/types";

const mockSubject: SubjectAnalysis = {
  face: {
    shape: "oval",
    jaw: "soft",
    skinTone: "medium olive",
    undertone: "warm",
    hair: "short, dark brown, wavy",
  },
  body: {
    build: "slim",
    shoulders: "narrow",
    height: "average",
  },
  vibe: {
    confidence: 0.7,
    expression: "calm half-smile",
    perceivedAge: 25,
  },
};

// ============================================================
// Image Analysis Prompt
// ============================================================

describe("buildImageAnalysisSystemPrompt", () => {
  it("requests structured JSON output", () => {
    const prompt = buildImageAnalysisSystemPrompt();
    expect(prompt).toContain("JSON");
    expect(prompt).toContain("face");
    expect(prompt).toContain("undertone");
    expect(prompt).toContain("warm");
    expect(prompt).toContain("cool");
    expect(prompt).toContain("neutral");
    expect(prompt).toContain("body");
    expect(prompt).toContain("vibe");
    expect(prompt).toContain("confidence");
  });
});

// ============================================================
// Logo Prompt (unchanged, no subjectAnalysis)
// ============================================================

describe("buildLogoPrompt", () => {
  it("includes stage name and genre", () => {
    const prompt = buildLogoPrompt("ZILIZ", "Hip-Hop");
    expect(prompt).toContain("ZILIZ");
    expect(prompt).toContain("Hip-Hop");
    expect(prompt).toContain("logo");
  });

  it("works without genre", () => {
    const prompt = buildLogoPrompt("ZILIZ");
    expect(prompt).toContain("ZILIZ");
    expect(prompt).not.toContain("undefined");
  });
});

// ============================================================
// Studio Photo — Creative Engine Path
// ============================================================

describe("buildStudioPhotoPrompt — with subjectAnalysis", () => {
  const params: ImagePromptParams = {
    stageName: "ZILIZ",
    genre: "Hip-Hop",
    vibe: "confident",
    subjectAnalysis: mockSubject,
  };

  it("uses creative engine (contains archetype name)", () => {
    const prompt = buildStudioPhotoPrompt(params);
    expect(prompt).toContain("Luxury Rap");
  });

  it("contains scene details", () => {
    const prompt = buildStudioPhotoPrompt(params);
    expect(prompt).toContain("Scene:");
    expect(prompt).toContain("props:");
  });

  it("contains fashion direction", () => {
    const prompt = buildStudioPhotoPrompt(params);
    expect(prompt).toContain("Wearing:");
  });

  it("contains identity directive exactly once", () => {
    const prompt = buildStudioPhotoPrompt(params);
    const count = (prompt.match(/visually identical/gi) || []).length;
    expect(count).toBe(1);
  });

  it("does NOT contain old CRITICAL repetition", () => {
    const prompt = buildStudioPhotoPrompt(params);
    expect(prompt).not.toContain("CRITICAL");
  });

  it("includes stage name with logo context", () => {
    const prompt = buildStudioPhotoPrompt(params);
    expect(prompt).toContain("ZILIZ");
    expect(prompt).toContain("logo");
  });

  it("includes quality tokens", () => {
    const prompt = buildStudioPhotoPrompt(params);
    expect(prompt).toContain("photorealistic");
    expect(prompt).toContain("natural skin pores");
  });
});

// ============================================================
// Studio Photo — Fallback Path (no subjectAnalysis)
// ============================================================

describe("buildStudioPhotoPrompt — fallback (no subjectAnalysis)", () => {
  const params: ImagePromptParams = {
    stageName: "AURA",
    genre: "R&B",
    vibe: "smooth",
  };

  it("uses fallback prompt with genre direction", () => {
    const prompt = buildStudioPhotoPrompt(params);
    expect(prompt).toContain("R&B");
    expect(prompt).toContain("velvet");
  });

  it("contains CRITICAL identity instruction (old style)", () => {
    const prompt = buildStudioPhotoPrompt(params);
    expect(prompt).toContain("CRITICAL");
  });

  it("includes stage name", () => {
    const prompt = buildStudioPhotoPrompt(params);
    expect(prompt).toContain("AURA");
  });
});

describe("buildStudioPhotoPrompt — fallback (no genre)", () => {
  it("falls back even with subjectAnalysis but no genre", () => {
    const params: ImagePromptParams = {
      stageName: "TEST",
      subjectAnalysis: mockSubject,
    };
    const prompt = buildStudioPhotoPrompt(params);
    // Without genre, can't build creative direction → fallback
    expect(prompt).toContain("CRITICAL");
  });
});

// ============================================================
// Portrait — Creative Engine Path
// ============================================================

describe("buildPortraitPrompt — with subjectAnalysis", () => {
  const params: ImagePromptParams = {
    stageName: "VOLT",
    genre: "Rock / Indie",
    vibe: "raw",
    subjectAnalysis: mockSubject,
  };

  it("uses creative engine with correct archetype", () => {
    const prompt = buildPortraitPrompt(params);
    expect(prompt).toContain("Street Avant");
  });

  it("contains identity directive exactly once", () => {
    const prompt = buildPortraitPrompt(params);
    const count = (prompt.match(/visually identical/gi) || []).length;
    expect(count).toBe(1);
  });

  it("does NOT contain old repeated identity text", () => {
    const prompt = buildPortraitPrompt(params);
    expect(prompt).not.toContain("DO NOT alter face shape");
    expect(prompt).not.toContain("CRITICAL");
  });

  it("includes environment for portrait", () => {
    const prompt = buildPortraitPrompt(params);
    expect(prompt).toContain("Environment:");
  });

  it("includes stage name", () => {
    const prompt = buildPortraitPrompt(params);
    expect(prompt).toContain("VOLT");
  });
});

// ============================================================
// Portrait — Fallback Path
// ============================================================

describe("buildPortraitPrompt — fallback (no subjectAnalysis)", () => {
  const params: ImagePromptParams = {
    stageName: "ECHO",
    genre: "Pop",
    vibe: "bright",
  };

  it("uses fallback with genre direction", () => {
    const prompt = buildPortraitPrompt(params);
    expect(prompt.toLowerCase()).toContain("pop");
    expect(prompt).toContain("high-key");
  });

  it("contains old-style identity instructions", () => {
    const prompt = buildPortraitPrompt(params);
    expect(prompt).toContain("CRITICAL");
    expect(prompt).toContain("DO NOT alter face shape");
  });
});

// ============================================================
// Different Subjects → Different Prompts
// ============================================================

describe("Subject-specific prompt variation", () => {
  it("warm vs cool undertone produces different accessories", () => {
    const warmParams: ImagePromptParams = {
      stageName: "TEST",
      genre: "Hip-Hop",
      subjectAnalysis: mockSubject,
    };

    const coolSubject: SubjectAnalysis = {
      ...mockSubject,
      face: { ...mockSubject.face, undertone: "cool" },
    };
    const coolParams: ImagePromptParams = {
      stageName: "TEST",
      genre: "Hip-Hop",
      subjectAnalysis: coolSubject,
    };

    const warmPrompt = buildPortraitPrompt(warmParams);
    const coolPrompt = buildPortraitPrompt(coolParams);

    // Both should be valid prompts but with different fashion details
    expect(warmPrompt).toContain("Wearing:");
    expect(coolPrompt).toContain("Wearing:");
    // They should not be identical (different jewelry at minimum)
    expect(warmPrompt).not.toBe(coolPrompt);
  });

  it("broad vs slim build produces different prompts", () => {
    const broadSubject: SubjectAnalysis = {
      ...mockSubject,
      body: { build: "athletic", shoulders: "broad", height: "tall" },
    };
    const slimSubject: SubjectAnalysis = {
      ...mockSubject,
      body: { build: "slim", shoulders: "narrow", height: "average" },
    };

    const broadPrompt = buildPortraitPrompt({
      stageName: "TEST",
      genre: "Hip-Hop",
      subjectAnalysis: broadSubject,
    });
    const slimPrompt = buildPortraitPrompt({
      stageName: "TEST",
      genre: "Hip-Hop",
      subjectAnalysis: slimSubject,
    });

    expect(broadPrompt).not.toBe(slimPrompt);
  });
});

// ============================================================
// JSON Cleaning (markdown fence stripping)
// ============================================================

describe("JSON cleaning for Gemini output", () => {
  function cleanJson(output: string): string {
    return output.trim().replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  }

  it("strips ```json fence", () => {
    const raw = '```json\n{"face": {"shape": "oval"}}\n```';
    const cleaned = cleanJson(raw);
    expect(() => JSON.parse(cleaned)).not.toThrow();
    const parsed = JSON.parse(cleaned);
    expect(parsed.face.shape).toBe("oval");
  });

  it("strips ``` fence without language tag", () => {
    const raw = '```\n{"face": {"shape": "round"}}\n```';
    const cleaned = cleanJson(raw);
    expect(() => JSON.parse(cleaned)).not.toThrow();
  });

  it("passes through clean JSON unchanged", () => {
    const raw = '{"face": {"shape": "square"}}';
    const cleaned = cleanJson(raw);
    expect(() => JSON.parse(cleaned)).not.toThrow();
    const parsed = JSON.parse(cleaned);
    expect(parsed.face.shape).toBe("square");
  });

  it("handles whitespace around fences", () => {
    const raw = '  ```json\n{"face": {"shape": "heart"}}\n```  ';
    const cleaned = cleanJson(raw);
    expect(() => JSON.parse(cleaned)).not.toThrow();
  });

  it("handles JSON with nested objects", () => {
    const raw = '```json\n{"face":{"shape":"oval","jaw":"soft","skinTone":"olive","undertone":"warm","hair":"short dark"},"body":{"build":"slim","shoulders":"narrow","height":"average"},"vibe":{"confidence":0.7,"expression":"calm","perceivedAge":25}}\n```';
    const cleaned = cleanJson(raw);
    const parsed = JSON.parse(cleaned);
    expect(parsed.face.undertone).toBe("warm");
    expect(parsed.body.build).toBe("slim");
    expect(parsed.vibe.confidence).toBe(0.7);
  });
});

// ============================================================
// Variant Index — Different looks per name
// ============================================================

describe("variantIndex produces different prompts", () => {
  const baseParams: ImagePromptParams = {
    stageName: "TEST",
    genre: "Hip-Hop",
    subjectAnalysis: mockSubject,
  };

  it("different variantIndex produces different portrait prompts", () => {
    const prompt0 = buildPortraitPrompt({ ...baseParams, variantIndex: 0 });
    const prompt1 = buildPortraitPrompt({ ...baseParams, variantIndex: 1 });
    const prompt2 = buildPortraitPrompt({ ...baseParams, variantIndex: 2 });

    expect(prompt0).not.toBe(prompt1);
    expect(prompt1).not.toBe(prompt2);
    expect(prompt0).not.toBe(prompt2);
  });

  it("different variantIndex produces different studio prompts", () => {
    const prompt0 = buildStudioPhotoPrompt({ ...baseParams, variantIndex: 0 });
    const prompt1 = buildStudioPhotoPrompt({ ...baseParams, variantIndex: 1 });
    const prompt2 = buildStudioPhotoPrompt({ ...baseParams, variantIndex: 2 });

    expect(prompt0).not.toBe(prompt1);
    expect(prompt1).not.toBe(prompt2);
  });

  it("all variants share the same archetype", () => {
    const prompt0 = buildPortraitPrompt({ ...baseParams, variantIndex: 0 });
    const prompt1 = buildPortraitPrompt({ ...baseParams, variantIndex: 1 });
    const prompt2 = buildPortraitPrompt({ ...baseParams, variantIndex: 2 });

    expect(prompt0).toContain("Luxury Rap");
    expect(prompt1).toContain("Luxury Rap");
    expect(prompt2).toContain("Luxury Rap");
  });

  it("variants use different scenes (Environment/Scene keyword)", () => {
    const prompt0 = buildPortraitPrompt({ ...baseParams, variantIndex: 0 });
    const prompt1 = buildPortraitPrompt({ ...baseParams, variantIndex: 1 });

    // Extract environment text after "Environment:"
    const env0 = prompt0.split("Environment:")[1]?.split(".")[0] ?? "";
    const env1 = prompt1.split("Environment:")[1]?.split(".")[0] ?? "";

    expect(env0.trim()).not.toBe(env1.trim());
  });

  it("variants use different fashion", () => {
    const prompt0 = buildPortraitPrompt({ ...baseParams, variantIndex: 0 });
    const prompt1 = buildPortraitPrompt({ ...baseParams, variantIndex: 1 });

    const wearing0 = prompt0.split("Wearing:")[1]?.split(".")[0] ?? "";
    const wearing1 = prompt1.split("Wearing:")[1]?.split(".")[0] ?? "";

    expect(wearing0.trim()).not.toBe(wearing1.trim());
  });

  it("undefined variantIndex defaults to 0", () => {
    const promptDefault = buildPortraitPrompt(baseParams);
    const promptExplicit = buildPortraitPrompt({ ...baseParams, variantIndex: 0 });

    expect(promptDefault).toBe(promptExplicit);
  });
});
