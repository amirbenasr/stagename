import type { SubjectAnalysis } from "../creative-engine/types";
import {
  buildCreativeDirection,
  fashionToPromptText,
  lightingToPromptText,
  IDENTITY_DIRECTIVE,
} from "../creative-engine";

// ============================================================
// Video Direction Engine — the creative layer of the First Take
// ============================================================
//
// The still-image engine already decides scene, fashion, pose and lighting.
// This module reuses those decisions for the video frame, then adds the two
// things a still never needs: performance energy and camera movement.
//
// Technique: we render ONE composed frame first, then animate that frame.
// Animating a controlled still is far more reliable than asking a video model
// to invent a scene from a selfie — identity drift, stray limbs and random
// environments all go down sharply.

export interface GenrePerformance {
  bpm: number;
  energy: string;
  bodyLanguage: string;
  cameraMove: string;
}

export interface PerformanceDirection {
  stageName: string;
  genre: string;
  vibe: string;
  bpm: number;
  energy: string;
  bodyLanguage: string;
  cameraMove: string;
  location: string;
  lighting: string;
  wardrobe: string;
  framePrompt: string;
  motionPrompt: string;
  aspectRatio: "16:9" | "9:16";
  durationSeconds: number;
}

const DEFAULT_PERFORMANCE: GenrePerformance = {
  bpm: 100,
  energy: "confident and magnetic",
  bodyLanguage:
    "leaning into the microphone, lips shaping each bar, head nodding on the beat, one hand punctuating the line",
  cameraMove: "slow handheld push-in with subtle micro-shake",
};

const PERFORMANCE_BY_GENRE: Array<{ match: string[]; preset: GenrePerformance }> = [
  {
    match: ["hip-hop", "hip hop", "rap", "trap", "drill"],
    preset: {
      bpm: 90,
      energy: "heavy, swaggering and unbothered",
      bodyLanguage:
        "chin lifted, shoulders rolling, sharp hand gestures punctuating each bar, a slow head nod that lands on the kick",
      cameraMove: "slow handheld push-in with a low, deliberate drift",
    },
  },
  {
    match: ["r&b", "rnb", "soul"],
    preset: {
      bpm: 72,
      energy: "intimate, smooth and magnetic",
      bodyLanguage:
        "close to the mic, eyes half-closed, subtle sway, one hand resting near the chest, breath visible between lines",
      cameraMove: "almost still, with a gentle breathing camera and soft rack focus",
    },
  },
  {
    match: ["pop"],
    preset: {
      bpm: 118,
      energy: "bright, playful and undeniable",
      bodyLanguage:
        "rhythmic bounce on the balls of the feet, big expression, hand moving from the mic out toward the lens",
      cameraMove: "smooth push-in with a light handheld float",
    },
  },
  {
    match: ["electronic", "edm", "house", "techno"],
    preset: {
      bpm: 128,
      energy: "hypnotic, controlled and cold-burning",
      bodyLanguage:
        "eyes locked on the mic, minimal precise gestures, slow head nod, stillness that reads as confidence",
      cameraMove: "slow dolly-in with a faint parallax drift",
    },
  },
  {
    match: ["rock", "indie", "punk", "metal"],
    preset: {
      bpm: 132,
      energy: "raw, urgent and unpolished",
      bodyLanguage:
        "gripping the mic stand, eyes closed, head thrown back on the hook, shoulders tense",
      cameraMove: "gritty handheld push-in with a little shake on the accents",
    },
  },
  {
    match: ["afrobeats", "amapiano", "afro"],
    preset: {
      bpm: 108,
      energy: "joyful, rhythmic and effortless",
      bodyLanguage:
        "shoulders and hips moving with the groove, an easy smile, hands accenting the rhythm",
      cameraMove: "warm handheld push-in that moves with the groove",
    },
  },
  {
    match: ["latin", "reggaeton", "corrido"],
    preset: {
      bpm: 96,
      energy: "magnetic, percussive and proud",
      bodyLanguage:
        "confident smirk, body rolls on the dembow, one hand slicing the air on the downbeat",
      cameraMove: "smooth push-in with a slight side drift",
    },
  },
  {
    match: ["jazz", "blues"],
    preset: {
      bpm: 70,
      energy: "warm, lived-in and unhurried",
      bodyLanguage:
        "eyes closed, expressive hands, a gentle sway, the mic held close like a secret",
      cameraMove: "near-static camera with a slow, intimate creep forward",
    },
  },
  {
    match: ["experimental", "avant", "ambient"],
    preset: {
      bpm: 100,
      energy: "unpredictable and theatrical",
      bodyLanguage:
        "asymmetric gestures, intense unblinking stare, sudden stillness followed by a sharp movement",
      cameraMove: "unsettling slow push-in with an occasional micro-jolt",
    },
  },
  {
    match: ["country", "folk", "americana"],
    preset: {
      bpm: 84,
      energy: "grounded, honest and warm",
      bodyLanguage:
        "easy storytelling delivery, small nods, one hand resting on the mic stand, a half-smile on the hook",
      cameraMove: "steady, patient push-in with a natural handheld feel",
    },
  },
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function getGenrePerformance(genre: string): GenrePerformance {
  const g = normalize(genre || "");

  for (const entry of PERFORMANCE_BY_GENRE) {
    if (entry.match.some((token) => g.includes(token))) {
      return entry.preset;
    }
  }

  return DEFAULT_PERFORMANCE;
}

export function buildPerformanceDirection(input: {
  stageName: string;
  genre: string;
  vibe: string;
  subject?: SubjectAnalysis | null;
  aspectRatio?: "16:9" | "9:16";
  durationSeconds?: number;
}): PerformanceDirection {
  const { stageName, genre, vibe, subject } = input;
  const performance = getGenrePerformance(genre);

  const creative = subject ? buildCreativeDirection(subject, genre, 0) : null;

  const location =
    creative?.scene.location ?? "professional recording booth with acoustic paneling";

  const lighting = creative
    ? lightingToPromptText(creative.lighting)
    : "warm broadcast key light, soft rim light, subtle haze catching the beam";

  const wardrobe = creative
    ? fashionToPromptText(creative.fashion)
    : "a premium all-black outfit with subtle luxury accessories";

  const aspectRatio = input.aspectRatio ?? "16:9";
  const durationSeconds = input.durationSeconds ?? 10;

  const framePrompt = [
    IDENTITY_DIRECTIVE,
    `A single photorealistic cinematic film still of this exact person as "${stageName}".`,
    `They are standing at a professional large-diaphragm condenser microphone on a shock mount in a ${location}, leaning in close to the mic, mouth open mid-bar, jaw engaged, eyes locked on the microphone. ${performance.bodyLanguage}.`,
    `They wear over-ear studio headphones and ${wardrobe}.`,
    `Camera: medium close-up, 50mm lens, f/1.8, shallow depth of field, ${aspectRatio} frame, cinematic film still, subtle handheld framing.`,
    `Lighting: ${lighting}.`,
    `Mood: ${vibe || performance.energy}. ${performance.energy}.`,
    `Detail: realistic skin texture and pores, flyaway hair, fabric folds, subtle atmospheric haze, gentle lens flare, film-grade color, HDR, ultra-detailed.`,
    `The frame must feel like a still from a music film — intimate, tense and alive.`,
    `No text, no captions, no logos, no watermarks, no extra people, no duplicated limbs.`,
  ].join(" ");

  const motionPrompt = [
    `Animate this exact frame into a ${durationSeconds}-second cinematic performance clip.`,
    `Keep the composition, face, hair, skin tone, wardrobe, microphone and lighting identical to the reference at all times.`,
    `Performance: the artist raps into the microphone with ${performance.energy} energy — lips articulate each word, jaw and neck move naturally, head nods on the beat, shoulders roll, ${performance.bodyLanguage}.`,
    `Camera: ${performance.cameraMove}. Stay in one continuous shot — no cuts, no whip pans, no zooming past the face.`,
    `Realism: natural blinks, micro-expressions, breathing, fabric movement, true-to-life motion blur and a 24fps film look.`,
    `Avoid: identity drift, face morphing, changing clothes, changing background, extra fingers, extra limbs, text, captions, logos, watermarks, crowds, multiple people.`,
    `Audio: a ${genre || "modern"} instrumental at ${performance.bpm} BPM, no vocals, no lyrics, no spoken words. The beat should drive the head nods.`,
  ].join(" ");

  return {
    stageName,
    genre: genre || "modern",
    vibe: vibe || performance.energy,
    bpm: performance.bpm,
    energy: performance.energy,
    bodyLanguage: performance.bodyLanguage,
    cameraMove: performance.cameraMove,
    location,
    lighting,
    wardrobe,
    framePrompt,
    motionPrompt,
    aspectRatio,
    durationSeconds,
  };
}
