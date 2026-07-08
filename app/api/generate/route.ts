import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { adminDb, adminStorage } from "../../../lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { sendBrandKitReadyEmail } from "../../../lib/email";

fal.config({
  credentials: process.env.FAL_KEY!,
});

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stagenameclub.firebasestorage.app";

async function saveImageToStorage(imageUrl: string, submissionId: string, filename: string): Promise<string> {
  if (!imageUrl) return "";

  if (!adminStorage) {
    console.error(`adminStorage is null — cannot save ${filename}. Falling back to fal.ai URL.`);
    return imageUrl;
  }

  try {
    console.log(`Downloading ${filename} from: ${imageUrl}`);
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.error(`Failed to download ${filename}: HTTP ${res.status}`);
      return imageUrl;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    console.log(`Downloaded ${filename}: ${buffer.length} bytes`);

    const file = adminStorage.bucket(BUCKET).file(`brandkits/${submissionId}/${filename}`);
    await file.save(buffer, { contentType: "image/jpeg", public: true });

    const publicUrl = `https://storage.googleapis.com/${BUCKET}/brandkits/${submissionId}/${filename}`;
    console.log(`Saved ${filename} to: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error(`Failed to save ${filename} to storage:`, err);
    return imageUrl;
  }
}

interface StageNameResult {
  name: string;
  reason: string;
  model: string;
}

interface PlatformAvailability {
  available: boolean;
  handle: string | null;
}

interface NameAvailability {
  spotify: PlatformAvailability;
  appleMusic: PlatformAvailability;
  instagram: PlatformAvailability;
  facebook: PlatformAvailability;
  domainCom: PlatformAvailability;
}

interface BrandKitData {
  submissionId: string;
  slug: string;
  stageNames: StageNameResult[];
  portraitImageUrl: string;
  logoImageUrl: string;
  studioPhotoUrl: string;
  availability: Record<string, NameAvailability>;
  status: string;
  createdAt: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
}

function simulateAvailability(name: string): NameAvailability {
  const slug = slugify(name);
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const isUnique = name.split(" ").length >= 2 || name.length > 8;

  const avail = (platform: string): PlatformAvailability => {
    const seed = hash + platform.length;
    const available = isUnique ? seed % 3 !== 0 : seed % 2 === 0;
    return {
      available,
      handle: available ? (platform === "domainCom" ? `${slug}.com` : `@${slug}`) : null,
    };
  };

  return {
    spotify: avail("spotify"),
    appleMusic: avail("applemusic"),
    instagram: avail("instagram"),
    facebook: avail("facebook"),
    domainCom: avail("domainCom"),
  };
}

function buildArtistContext(answers: Record<string, string | string[]>): string {
  const parts: string[] = [];

  if (answers.artistName) parts.push(`Artist goes by: ${answers.artistName}`);
  if (answers.genre) parts.push(`Music genre: ${answers.genre}`);
  if (answers.origin) parts.push(`From: ${answers.origin}`);
  if (answers.platforms) {
    const p = Array.isArray(answers.platforms) ? answers.platforms.join(", ") : answers.platforms;
    parts.push(`Platforms: ${p}`);
  }
  if (answers.vibe) parts.push(`Vibe/Energy: ${answers.vibe}`);
  if (answers.persona) parts.push(`On-stage persona: ${answers.persona}`);
  if (answers.drive) parts.push(`Artistic drive: ${answers.drive}`);
  if (answers.visualWorld) parts.push(`Visual world: ${answers.visualWorld}`);
  if (answers.languages) {
    const l = Array.isArray(answers.languages) ? answers.languages.join(", ") : answers.languages;
    parts.push(`Languages: ${l}`);
  }

  return parts.join("\n");
}

function unwrapJsonString(raw: string): string {
  try {
    let parsed = JSON.parse(raw);
    // Recursively unwrap if the value is still a JSON string
    while (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        break;
      }
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
    return raw;
  }
}

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
    } as any,
  });

  const raw =
    (result as any)?.output ??
    (result as any)?.choices?.[0]?.message?.content ??
    JSON.stringify(result);

  if (typeof raw === "string") {
    return unwrapJsonString(raw);
  }

  return unwrapJsonString(JSON.stringify(raw));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    }

    const submissionDoc = await adminDb.collection("submissions").doc(submissionId).get();

    if (!submissionDoc.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const submission = submissionDoc.data()!;
    const { answers, selfieUrl, email } = submission;

    const artistContext = buildArtistContext(answers || {});

    // === Step 1: Image Analysis ===
    let imageAnalysis = "";
    if (selfieUrl) {
      try {
        const analysisOutput = await callOpenRouter(
          "google/gemini-2.5-flash",
          "You are a visual analyst. Describe the person in the image in detail for an artist branding context. Focus on: face shape, skin tone, hair style and color, notable accessories, clothing style, and overall aesthetic vibe. Be specific and concise — max 150 words.",
          "Describe this person's look in detail for creating a consistent AI-generated portrait of them.",
          selfieUrl
        );
        imageAnalysis = analysisOutput.trim();
      } catch (err) {
        console.error("Image analysis failed, continuing without it:", err);
      }
    }

    // === Step 2: Generate 3 Stage Names (3 separate model calls in parallel) ===
    const nameSystemPrompt = (angle: string) => `You are a high-end Music Creative Director specializing in artist brand development. Your creative angle is: ${angle}.

You MUST respond ONLY with valid JSON — no markdown, no extra text:
{ "name": "stage name", "reason": "2-3 sentence explanation of why this name fits this artist" }

Requirements:
- Generate exactly 1 stage name
- The name must reflect the artist's own identity, vibe, and aesthetic
- The reason must explain why the name fits THIS specific artist
- Name should be memorable, marketable, and suitable for streaming platforms
- Avoid cultural appropriation; ensure authenticity`;

    const nameGeneration = async (
      model: string,
      angle: string,
      label: string
    ): Promise<StageNameResult> => {
      const userPrompt = `Create 1 brandable stage name for an artist with these characteristics:\n${artistContext}${
        imageAnalysis ? `\n\nVisual profile: ${imageAnalysis}` : ""
      }`;

      try {
        const raw = await callOpenRouter(
          model,
          nameSystemPrompt(angle),
          userPrompt
        );

        const cleaned = raw
          .replace(/^```json\n?/, "")
          .replace(/\n?```$/, "")
          .trim();

        const parsed = JSON.parse(cleaned);

        return {
          name: parsed.name || `Name ${label}`,
          reason: parsed.reason || "AI-generated brand name",
          model: label,
        };
      } catch (err) {
        console.error(`Name generation failed for ${label}:`, err);
        return {
          name: `Name ${label}`,
          reason: "Generation encountered an issue",
          model: label,
        };
      }
    };

    const [name1, name2, name3] = await Promise.all([
      nameGeneration(
        "deepseek/deepseek-v4-flash",
        "Linguistic creativity — wordplay, portmanteaus, phonetic impact, unique letter combinations",
        "DeepSeek (Linguistic)"
      ),
      nameGeneration(
        "openai/gpt-5.5",
        "Cultural depth — meaning, origin, identity resonance, names that carry weight and story",
        "GPT-5.5 (Cultural)"
      ),
      nameGeneration(
        "google/gemini-3-flash-preview",
        "Marketability — memorability, SEO-friendliness, platform search uniqueness, brand recall",
        "Gemini 3 (Market)"
      ),
    ]);

    const stageNames = [name1, name2, name3];

    // === Step 3: Generate Logo ===
    const bestName = stageNames[0].name;
    const logoPrompt = `Minimalist artist logo design for "${bestName}", clean typography, iconic symbol, professional brand mark, suitable for social media and merchandise, vector-style design`;

    const logoResult = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: logoPrompt,
        image_size: "square_hd",
        num_inference_steps: 20,
      },
    });

    const rawLogoUrl = (logoResult as any)?.data?.images?.[0]?.url ?? (logoResult as any)?.images?.[0]?.url ?? "";

    // === Step 4: Generate Studio Photo (artist sitting in front of logo) ===
    const studioPrompt = `Professional studio photograph of this exact person, sitting confidently in front of their "${bestName}" logo on a wall behind them, cinematic lighting, fashion editorial style, high-end music artist branding photo, sharp focus, 8k quality, keep the person's face and features identical`;

    const studioInput: Record<string, unknown> = {
      prompt: studioPrompt,
    };
    if (selfieUrl) studioInput.image_urls = [selfieUrl];

    const studioResult = await fal.subscribe("fal-ai/flux-2-pro/edit", {
      input: studioInput as any,
    });

    const rawStudioUrl = (studioResult as any)?.data?.images?.[0]?.url ?? (studioResult as any)?.images?.[0]?.url ?? "";

    // === Step 5: Generate Portrait ===
    const portraitPrompt = `Professional artist portrait photo of this exact person, stylish and atmospheric, cinematic lighting, suitable for Spotify profile artwork, high quality, keep the person's face and features identical, ${bestName}`;

    const portraitInput: Record<string, unknown> = {
      prompt: portraitPrompt,
    };
    if (selfieUrl) portraitInput.image_urls = [selfieUrl];

    const portraitResult = await fal.subscribe("fal-ai/flux-2-pro/edit", {
      input: portraitInput as any,
    });

    const rawPortraitUrl = (portraitResult as any)?.data?.images?.[0]?.url ?? (portraitResult as any)?.images?.[0]?.url ?? "";

    console.log("Raw image URLs from fal.ai:", { logo: rawLogoUrl, studio: rawStudioUrl, portrait: rawPortraitUrl });

    // === Step 5b: Save all images to Firebase Storage ===
    const [logoImageUrl, studioPhotoUrl, portraitImageUrl] = await Promise.all([
      saveImageToStorage(rawLogoUrl, submissionId, "logo.jpg"),
      saveImageToStorage(rawStudioUrl, submissionId, "studio.jpg"),
      saveImageToStorage(rawPortraitUrl, submissionId, "portrait.jpg"),
    ]);

    // === Step 6: Simulated Platform Availability ===
    const availability: Record<string, NameAvailability> = {};
    for (const sn of stageNames) {
      availability[sn.name] = simulateAvailability(sn.name);
    }

    // === Step 7: Save brand kit to Firestore ===
    const slug = uuidv4().slice(0, 8);
    const brandKitData: BrandKitData = {
      submissionId,
      slug,
      stageNames,
      portraitImageUrl,
      logoImageUrl,
      studioPhotoUrl,
      availability,
      status: "complete",
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection("brandKits").doc(slug).set(brandKitData);

    await adminDb.collection("submissions").doc(submissionId).update({
      status: "complete",
      brandKitSlug: slug,
    });

    // === Step 8: Send brand-kit-ready email ===
    if (email) {
      try {
        await sendBrandKitReadyEmail(email, slug);
      } catch (err) {
        console.error("Failed to send brand kit ready email:", err);
      }
    }

    return NextResponse.json(brandKitData, { status: 200 });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
