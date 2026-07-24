import { describe, it, expect } from "vitest";
import {
  buildPodcastSystemPrompt,
  buildPodcastUserPrompt,
  type PodcastContext,
} from "../podcast-prompts";

// ============================================================
// System Prompt
// ============================================================

describe("buildPodcastSystemPrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = buildPodcastSystemPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("specifies the show style", () => {
    const prompt = buildPodcastSystemPrompt();
    expect(prompt).toContain("late-night");
  });

  it("requires JSON array output", () => {
    const prompt = buildPodcastSystemPrompt();
    expect(prompt).toContain("JSON");
    expect(prompt).toContain("array");
  });

  it("defines all segment types", () => {
    const prompt = buildPodcastSystemPrompt();
    expect(prompt).toContain("host");
    expect(prompt).toContain("artist");
    expect(prompt).toContain("audience");
    expect(prompt).toContain("music");
  });

  it("requires first and last segments to be music", () => {
    const prompt = buildPodcastSystemPrompt();
    expect(prompt.toLowerCase()).toContain("first");
    expect(prompt.toLowerCase()).toContain("last");
  });
});

// ============================================================
// User Prompt — Basic
// ============================================================

describe("buildPodcastUserPrompt", () => {
  const baseCtx: PodcastContext = {
    stageName: "ZILIZ",
    nameReason: "A Swahili word meaning 'to create'",
    genre: "Afrobeat",
    vibe: "electric",
  };

  it("includes the stage name", () => {
    const prompt = buildPodcastUserPrompt(baseCtx);
    expect(prompt).toContain("ZILIZ");
  });

  it("includes the name reason", () => {
    const prompt = buildPodcastUserPrompt(baseCtx);
    expect(prompt).toContain("Swahili");
  });

  it("includes genre", () => {
    const prompt = buildPodcastUserPrompt(baseCtx);
    expect(prompt).toContain("Afrobeat");
  });

  it("includes vibe", () => {
    const prompt = buildPodcastUserPrompt(baseCtx);
    expect(prompt).toContain("electric");
  });
});

// ============================================================
// User Prompt — Optional Fields
// ============================================================

describe("buildPodcastUserPrompt — optional fields", () => {
  it("includes origin when provided", () => {
    const ctx: PodcastContext = {
      stageName: "TEST",
      nameReason: "test",
      genre: "Pop",
      vibe: "chill",
      origin: "Nairobi, Kenya",
    };
    const prompt = buildPodcastUserPrompt(ctx);
    expect(prompt).toContain("Nairobi, Kenya");
  });

  it("includes influences when provided", () => {
    const ctx: PodcastContext = {
      stageName: "TEST",
      nameReason: "test",
      genre: "Pop",
      vibe: "chill",
      influences: "Burna Boy, Wizkid, Tems",
    };
    const prompt = buildPodcastUserPrompt(ctx);
    expect(prompt).toContain("Burna Boy");
  });

  it("includes persona when provided", () => {
    const ctx: PodcastContext = {
      stageName: "TEST",
      nameReason: "test",
      genre: "Pop",
      vibe: "chill",
      persona: "Mysterious and charismatic",
    };
    const prompt = buildPodcastUserPrompt(ctx);
    expect(prompt).toContain("Mysterious");
  });

  it("includes drive when provided", () => {
    const ctx: PodcastContext = {
      stageName: "TEST",
      nameReason: "test",
      genre: "Pop",
      vibe: "chill",
      drive: "To make people dance",
    };
    const prompt = buildPodcastUserPrompt(ctx);
    expect(prompt).toContain("make people dance");
  });

  it("includes visual world when provided", () => {
    const ctx: PodcastContext = {
      stageName: "TEST",
      nameReason: "test",
      genre: "Pop",
      vibe: "chill",
      visualWorld: "Neon-lit streets and golden hour",
    };
    const prompt = buildPodcastUserPrompt(ctx);
    expect(prompt).toContain("Neon-lit");
  });

  it("includes real name when provided", () => {
    const ctx: PodcastContext = {
      stageName: "TEST",
      nameReason: "test",
      genre: "Pop",
      vibe: "chill",
      realName: "John Doe",
    };
    const prompt = buildPodcastUserPrompt(ctx);
    expect(prompt).toContain("John Doe");
  });

  it("includes languages when provided", () => {
    const ctx: PodcastContext = {
      stageName: "TEST",
      nameReason: "test",
      genre: "Pop",
      vibe: "chill",
      languages: "Swahili, English",
    };
    const prompt = buildPodcastUserPrompt(ctx);
    expect(prompt).toContain("Swahili, English");
  });

  it("omits fields that are not provided", () => {
    const ctx: PodcastContext = {
      stageName: "MINIMAL",
      nameReason: "just a name",
      genre: "Lo-fi",
      vibe: "calm",
    };
    const prompt = buildPodcastUserPrompt(ctx);
    expect(prompt).not.toContain("From:");
    expect(prompt).not.toContain("Influences:");
    expect(prompt).not.toContain("persona");
    expect(prompt).not.toContain("Real name:");
  });

  it("includes all fields when all are provided", () => {
    const ctx: PodcastContext = {
      stageName: "FULL",
      nameReason: "full context",
      genre: "Jazz",
      vibe: "smooth",
      origin: "New Orleans",
      influences: "Miles Davis, Coltrane",
      persona: "Cool cat",
      drive: "To move souls",
      visualWorld: "Smoky clubs and velvet curtains",
      realName: "Jane Smith",
      languages: "English, French",
    };
    const prompt = buildPodcastUserPrompt(ctx);
    expect(prompt).toContain("FULL");
    expect(prompt).toContain("New Orleans");
    expect(prompt).toContain("Miles Davis");
    expect(prompt).toContain("Cool cat");
    expect(prompt).toContain("move souls");
    expect(prompt).toContain("Smoky clubs");
    expect(prompt).toContain("Jane Smith");
    expect(prompt).toContain("English, French");
  });
});
