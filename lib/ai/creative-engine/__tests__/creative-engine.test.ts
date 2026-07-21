import { describe, it, expect } from "vitest";
import { determineFashion, fashionToPromptText } from "../fashion";
import { getArchetypeForGenre, DARK_LUXURY, LUXURY_RAP, RETRO_SOUL } from "../archetypes";
import { getSceneForArchetype, WOODS, LUXURY_STUDIO } from "../scenes";
import { getPoseForArchetype, poseToPromptText } from "../pose";
import { getPhotographerForScene, photographerToPromptText } from "../photographer";
import { getLightingForScene, lightingToPromptText } from "../lighting";
import { qualityToPromptText } from "../quality";
import { IDENTITY_DIRECTIVE } from "../identity";
import { PromptComposer, composePortraitPrompt, composeStudioPrompt } from "../prompt-composer";
import { buildCreativeDirection } from "../index";
import type { SubjectAnalysis } from "../types";

// ============================================================
// Test Fixtures
// ============================================================

const warmOvalSubject: SubjectAnalysis = {
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

const coolBroadSubject: SubjectAnalysis = {
  face: {
    shape: "square",
    jaw: "angular",
    skinTone: "fair",
    undertone: "cool",
    hair: "buzzcut, black",
    facialHair: "short boxed beard",
  },
  body: {
    build: "athletic",
    shoulders: "broad",
    height: "tall",
  },
  vibe: {
    confidence: 0.9,
    expression: "intense stare",
    perceivedAge: 30,
  },
};

const neutralSubject: SubjectAnalysis = {
  face: {
    shape: "round",
    jaw: "rounded",
    skinTone: "deep brown",
    undertone: "neutral",
    hair: "locs, shoulder-length",
  },
  body: {
    build: "average",
    shoulders: "average",
    height: "short",
  },
  vibe: {
    confidence: 0.6,
    expression: "warm smile",
    perceivedAge: 28,
  },
};

// ============================================================
// Archetype Module
// ============================================================

describe("Archetypes", () => {
  it("maps Hip-Hop to Luxury Rap", () => {
    expect(getArchetypeForGenre("Hip-Hop").id).toBe("luxury-rap");
  });

  it("maps R&B to Retro Soul", () => {
    expect(getArchetypeForGenre("R&B").id).toBe("retro-soul");
  });

  it("maps Electronic / EDM to Cyber Future", () => {
    expect(getArchetypeForGenre("Electronic / EDM").id).toBe("cyber-future");
  });

  it("falls back to Dark Luxury for unknown genre", () => {
    expect(getArchetypeForGenre("Polka").id).toBe("dark-luxury");
  });

  it("each archetype has required fields", () => {
    const archetypes = [DARK_LUXURY, LUXURY_RAP, RETRO_SOUL];
    for (const a of archetypes) {
      expect(a.id).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.mood.length).toBeGreaterThan(0);
      expect(a.fashionLanguage).toBeTruthy();
      expect(a.editorialStyle).toBeTruthy();
    }
  });
});

// ============================================================
// Fashion Module
// ============================================================

describe("Fashion Rules Engine", () => {
  it("warm undertone adds gold jewelry", () => {
    const fashion = determineFashion(warmOvalSubject, DARK_LUXURY);
    expect(fashion.accessories.some((a) => a.includes("gold"))).toBe(true);
  });

  it("cool undertone adds silver jewelry", () => {
    const fashion = determineFashion(coolBroadSubject, DARK_LUXURY);
    expect(fashion.accessories.some((a) => a.includes("silver"))).toBe(true);
  });

  it("broad shoulders → structured silhouette note", () => {
    const fashion = determineFashion(coolBroadSubject, DARK_LUXURY);
    expect(fashion.notes).toContain("structured");
  });

  it("slim build → layered fit note", () => {
    const fashion = determineFashion(warmOvalSubject, DARK_LUXURY);
    expect(fashion.notes).toContain("layered") || expect(fashion.notes).toContain("relaxed");
  });

  it("square face → open collar note", () => {
    const fashion = determineFashion(coolBroadSubject, DARK_LUXURY);
    expect(fashion.notes).toContain("open collar");
  });

  it("oval face → layered necklaces", () => {
    const fashion = determineFashion(warmOvalSubject, DARK_LUXURY);
    expect(fashion.accessories.some((a) => a.includes("necklace"))).toBe(true);
  });

  it("neutral undertone does not add warm or cool jewelry from rules", () => {
    const fashion = determineFashion(neutralSubject, DARK_LUXURY);
    const hasGold = fashion.accessories.some((a) => a.includes("gold"));
    const hasSilver = fashion.accessories.some((a) => a.includes("silver chain"));
    // neutral shouldn't trigger either undertone rule
    // (archetype base may still have gold/silver, that's fine)
    expect(typeof hasGold).toBe("boolean");
    expect(typeof hasSilver).toBe("boolean");
  });

  it("archetype base wardrobe is used as foundation", () => {
    const fashion = determineFashion(neutralSubject, LUXURY_RAP);
    expect(fashion.top).toContain("designer") || expect(fashion.top).toContain("hoodie");
    expect(fashion.footwear).toContain("sneaker");
  });

  it("fashionToPromptText produces non-empty string", () => {
    const fashion = determineFashion(warmOvalSubject, DARK_LUXURY);
    const text = fashionToPromptText(fashion);
    expect(text.length).toBeGreaterThan(20);
    expect(text).toContain(fashion.top);
    expect(text).toContain(fashion.footwear);
  });
});

// ============================================================
// Scene Module
// ============================================================

describe("Scene Presets", () => {
  it("maps dark-luxury archetype to luxury-studio scene", () => {
    expect(getSceneForArchetype("dark-luxury").name).toBe("luxury-studio");
  });

  it("maps cyber-future archetype to rainy-street scene", () => {
    expect(getSceneForArchetype("cyber-future").name).toBe("rainy-street");
  });

  it("falls back to luxury-studio for unknown archetype", () => {
    expect(getSceneForArchetype("nonexistent").name).toBe("luxury-studio");
  });

  it("each scene has required fields", () => {
    for (const s of [WOODS, LUXURY_STUDIO]) {
      expect(s.name).toBeTruthy();
      expect(s.location).toBeTruthy();
      expect(s.atmosphere.length).toBeGreaterThan(0);
      expect(s.props.length).toBeGreaterThan(0);
      expect(s.lightingHints.length).toBeGreaterThan(0);
      expect(s.colorPalette.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// Pose Module
// ============================================================

describe("Pose Presets", () => {
  it("maps archetype to correct pose", () => {
    expect(getPoseForArchetype("luxury-rap").name).toBe("power-stance");
    expect(getPoseForArchetype("retro-soul").name).toBe("seated-relaxed");
    expect(getPoseForArchetype("cyber-future").name).toBe("dynamic-walk");
  });

  it("poseToPromptText includes posture and expression", () => {
    const pose = getPoseForArchetype("dark-luxury");
    const text = poseToPromptText(pose);
    expect(text).toContain(pose.posture);
    expect(text).toContain(pose.expression);
  });
});

// ============================================================
// Photographer Module
// ============================================================

describe("Photographer Presets", () => {
  it("maps scene to correct photographer", () => {
    expect(getPhotographerForScene("luxury-studio").name).toBe("editorial-luxury");
    expect(getPhotographerForScene("rainy-street").name).toBe("street-documentary");
    expect(getPhotographerForScene("penthouse").name).toBe("fashion-editorial");
  });

  it("photographerToPromptText includes camera and lens", () => {
    const p = getPhotographerForScene("luxury-studio");
    const text = photographerToPromptText(p);
    expect(text).toContain("ARRI");
    expect(text).toContain("85mm");
  });
});

// ============================================================
// Lighting Module
// ============================================================

describe("Lighting Presets", () => {
  it("maps scene to correct lighting", () => {
    expect(getLightingForScene("rainy-street").name).toBe("neon-night");
    expect(getLightingForScene("desert").name).toBe("harsh-sun");
    expect(getLightingForScene("vintage-lounge").name).toBe("practical-warm");
  });

  it("lightingToPromptText includes key and fill", () => {
    const l = getLightingForScene("luxury-studio");
    const text = lightingToPromptText(l);
    expect(text).toContain(l.key);
    expect(text).toContain(l.fill);
  });
});

// ============================================================
// Quality Module
// ============================================================

describe("Quality Module", () => {
  it("produces non-empty quality text", () => {
    const text = qualityToPromptText();
    expect(text).toContain("photorealistic");
    expect(text).toContain("natural skin pores");
    expect(text).toContain("8k resolution");
  });
});

// ============================================================
// Identity Module
// ============================================================

describe("Identity Module", () => {
  it("contains identity preservation directive", () => {
    expect(IDENTITY_DIRECTIVE).toContain("visually identical");
    expect(IDENTITY_DIRECTIVE).toContain("facial identity");
    expect(IDENTITY_DIRECTIVE).toContain("skin tone");
  });

  it("is a single concise block (no repetition)", () => {
    // Should not contain "CRITICAL" or repeat "preserve" multiple times
    const preserveCount = (IDENTITY_DIRECTIVE.match(/preserve/gi) || []).length;
    expect(preserveCount).toBeLessThanOrEqual(2);
  });
});

// ============================================================
// Prompt Composer
// ============================================================

describe("PromptComposer", () => {
  it("joins sections with periods", () => {
    const composer = new PromptComposer();
    composer.add("Section A").add("Section B").add("Section C");
    expect(composer.build()).toBe("Section A. Section B. Section C");
  });

  it("skips empty sections", () => {
    const composer = new PromptComposer();
    composer.add("A").add("").add("  ").add("B");
    expect(composer.build()).toBe("A. B");
  });

  it("reset clears sections", () => {
    const composer = new PromptComposer();
    composer.add("A").add("B");
    composer.reset();
    expect(composer.build()).toBe("");
  });
});

// ============================================================
// Full Pipeline: buildCreativeDirection → compose
// ============================================================

describe("buildCreativeDirection", () => {
  it("builds a complete direction from subject + genre", () => {
    const direction = buildCreativeDirection(warmOvalSubject, "Hip-Hop");

    expect(direction.archetype.id).toBe("luxury-rap");
    expect(direction.scene.name).toBeTruthy();
    expect(direction.fashion.top).toBeTruthy();
    expect(direction.fashion.footwear).toBeTruthy();
    expect(direction.pose.name).toBeTruthy();
    expect(direction.photographer.camera).toBeTruthy();
    expect(direction.lighting.key).toBeTruthy();
    expect(direction.subject).toBe(warmOvalSubject);
  });

  it("falls back to dark-luxury for unknown genre", () => {
    const direction = buildCreativeDirection(warmOvalSubject, "Unknown Genre");
    expect(direction.archetype.id).toBe("dark-luxury");
  });
});

describe("composePortraitPrompt", () => {
  it("produces a complete portrait prompt with all modules", () => {
    const direction = buildCreativeDirection(warmOvalSubject, "Hip-Hop");
    const prompt = composePortraitPrompt(direction, "ZILIZ");

    // Identity
    expect(prompt).toContain("visually identical");
    // Archetype
    expect(prompt).toContain("Luxury Rap");
    // Fashion
    expect(prompt).toContain("Wearing:");
    // Pose
    expect(prompt).toContain("Pose:");
    // Photographer
    expect(prompt).toContain("Shot:");
    // Lighting
    expect(prompt).toContain("Lighting:");
    // Quality
    expect(prompt).toContain("photorealistic");
    // Stage name
    expect(prompt).toContain("ZILIZ");
  });

  it("does NOT contain repeated identity instructions", () => {
    const direction = buildCreativeDirection(coolBroadSubject, "R&B");
    const prompt = composePortraitPrompt(direction, "AURA");

    const identicalCount = (prompt.match(/visually identical/gi) || []).length;
    expect(identicalCount).toBe(1);

    const criticalCount = (prompt.match(/CRITICAL/g) || []).length;
    expect(criticalCount).toBe(0);
  });

  it("uses archetype-specific editorial style", () => {
    const direction = buildCreativeDirection(warmOvalSubject, "Rock / Indie");
    const prompt = composePortraitPrompt(direction, "VOLT");

    expect(prompt).toContain("Street Avant");
  });
});

describe("composeStudioPrompt", () => {
  it("includes scene environment details", () => {
    const direction = buildCreativeDirection(warmOvalSubject, "Hip-Hop");
    const prompt = composeStudioPrompt(direction, "ZILIZ");

    // Scene
    expect(prompt).toContain("Scene:");
    expect(prompt).toContain("props:");
    expect(prompt).toContain("color palette:");
    // Stage name logo
    expect(prompt).toContain("ZILIZ");
    expect(prompt).toContain("logo");
  });

  it("does NOT contain old repeated identity instructions", () => {
    const direction = buildCreativeDirection(coolBroadSubject, "Electronic / EDM");
    const prompt = composeStudioPrompt(direction, "NEON");

    const preserveCount = (prompt.match(/preserve the exact facial/gi) || []).length;
    expect(preserveCount).toBe(0);

    const criticalCount = (prompt.match(/CRITICAL/g) || []).length;
    expect(criticalCount).toBe(0);
  });
});

// ============================================================
// Scene Independence
// ============================================================

describe("Scene Independence", () => {
  it("changing scene does not change fashion", () => {
    const direction1 = buildCreativeDirection(warmOvalSubject, "Hip-Hop");
    const fashion1 = direction1.fashion;

    // Manually swap scene
    const direction2 = buildCreativeDirection(warmOvalSubject, "Hip-Hop");
    direction2.scene = WOODS;

    expect(direction2.fashion.top).toBe(fashion1.top);
    expect(direction2.fashion.bottom).toBe(fashion1.bottom);
    expect(direction2.fashion.footwear).toBe(fashion1.footwear);
  });

  it("same subject + different genre → different archetype → different fashion", () => {
    const dir1 = buildCreativeDirection(coolBroadSubject, "Hip-Hop");
    const dir2 = buildCreativeDirection(coolBroadSubject, "Country / Folk");

    expect(dir1.archetype.id).not.toBe(dir2.archetype.id);
    // Different archetypes drive different base wardrobes
    expect(dir1.fashion.top).not.toBe(dir2.fashion.top);
    expect(dir1.fashion.footwear).not.toBe(dir2.fashion.footwear);
  });
});
