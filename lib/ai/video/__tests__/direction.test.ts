import { describe, it, expect, afterEach } from "vitest";
import { buildPerformanceDirection, getGenrePerformance } from "../direction";
import { resolveMusic } from "../music";
import type { SubjectAnalysis } from "../../creative-engine/types";

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

const base = {
  stageName: "ZILIZ",
  genre: "Hip-Hop",
  vibe: "Chill & Dreamy",
  subject: mockSubject,
};

describe("getGenrePerformance", () => {
  it("maps hip-hop to a 90 BPM swagger preset", () => {
    const preset = getGenrePerformance("Hip-Hop");
    expect(preset.bpm).toBe(90);
    expect(preset.energy.toLowerCase()).toContain("swagger");
  });

  it("falls back to a default for unknown genres", () => {
    const preset = getGenrePerformance("Polka");
    expect(preset.bpm).toBe(100);
    expect(preset.bodyLanguage.length).toBeGreaterThan(0);
  });

  it("matches substrings and casing", () => {
    expect(getGenrePerformance("afrobeats / amapiano").bpm).toBe(108);
    expect(getGenrePerformance("Electronic / EDM").bpm).toBe(128);
  });
});

describe("buildPerformanceDirection", () => {
  it("composes a frame prompt with identity, mic and no text", () => {
    const direction = buildPerformanceDirection(base);

    expect(direction.framePrompt).toContain("Keep the subject visually identical");
    expect(direction.framePrompt).toContain("ZILIZ");
    expect(direction.framePrompt).toContain("condenser microphone");
    expect(direction.framePrompt).toContain("No text");
    expect(direction.framePrompt).toContain("16:9");
  });

  it("composes a motion prompt that locks identity and forbids cuts", () => {
    const direction = buildPerformanceDirection(base);

    expect(direction.motionPrompt).toContain("10-second");
    expect(direction.motionPrompt).toContain("no cuts");
    expect(direction.motionPrompt).toContain("90 BPM");
    expect(direction.motionPrompt).toContain("identity drift");
  });

  it("switches aspect ratio when asked for vertical", () => {
    const direction = buildPerformanceDirection({ ...base, aspectRatio: "9:16" });
    expect(direction.framePrompt).toContain("9:16");
    expect(direction.aspectRatio).toBe("9:16");
  });

  it("works without a subject analysis", () => {
    const direction = buildPerformanceDirection({
      stageName: "NARAS",
      genre: "Pop",
      vibe: "Fun & Playful",
      subject: null,
    });

    expect(direction.framePrompt).toContain("NARAS");
    expect(direction.wardrobe.length).toBeGreaterThan(0);
    expect(direction.lighting.length).toBeGreaterThan(0);
  });
});

describe("resolveMusic", () => {
  afterEach(() => {
    delete process.env.MUSIC_LIBRARY_JSON;
  });

  it("prefers the artist's uploaded track", () => {
    const music = resolveMusic("https://cdn.example.com/track.mp3", "Hip-Hop");
    expect(music).toEqual({
      url: "https://cdn.example.com/track.mp3",
      source: "artist",
      title: "Your track",
    });
  });

  it("returns null when nothing is configured", () => {
    expect(resolveMusic(undefined, "Hip-Hop")).toBeNull();
  });
});
