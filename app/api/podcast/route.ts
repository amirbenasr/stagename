import { NextRequest, NextResponse } from "next/server";
import { brandKitRepository } from "../../../lib/repositories/brand-kit-repository";
import { submissionRepository } from "../../../lib/repositories/submission-repository";
import { generatePodcastScript } from "../../../lib/ai/openrouter-client";
import type { PodcastContext, PodcastSegment } from "../../../lib/ai/podcast-prompts";

export async function POST(req: NextRequest) {
  try {
    const { slug, artistName, nameReason, genre, vibe } = await req.json();

    if (!slug && (!artistName || !nameReason)) {
      return NextResponse.json(
        { error: "slug or artistName+nameReason required" },
        { status: 400 }
      );
    }

    let ctx: PodcastContext;

    if (slug) {
      const brandKit = await brandKitRepository.findBySlug(slug);
      if (!brandKit) {
        return NextResponse.json({ error: "Brand kit not found" }, { status: 404 });
      }

      const submission = await submissionRepository.findById(brandKit.submissionId);
      const answers = submission?.answers ?? {};

      const topName = brandKit.names[0];
      ctx = {
        stageName: topName?.name ?? "",
        nameReason: topName?.reason ?? "",
        genre: brandKit.genre || "music",
        vibe: brandKit.vibe || "unique",
        origin: (answers.origin as string) || undefined,
        influences: Array.isArray(answers.influences)
          ? answers.influences.join(", ")
          : (answers.influences as string) || undefined,
        persona: (answers.persona as string) || undefined,
        drive: (answers.drive as string) || undefined,
        visualWorld: (answers.visualWorld as string) || undefined,
        realName: (answers.realName as string) || undefined,
        languages: Array.isArray(answers.languages)
          ? answers.languages.join(", ")
          : (answers.languages as string) || undefined,
      };
    } else {
      ctx = {
        stageName: artistName,
        nameReason,
        genre: genre || "music",
        vibe: vibe || "unique",
      };
    }

    let script: PodcastSegment[];

    try {
      script = await generatePodcastScript(ctx);
    } catch (aiErr) {
      console.error("AI podcast generation failed, using fallback:", aiErr);
      script = buildFallbackScript(ctx);
    }

    return NextResponse.json({ script });
  } catch (err) {
    console.error("Podcast generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate podcast script" },
      { status: 500 }
    );
  }
}

function buildFallbackScript(ctx: PodcastContext): PodcastSegment[] {
  return [
    { type: "music", text: "THEME MUSIC" },
    { type: "host", text: `Ladies and gentlemen — the one, the only, ${ctx.stageName}!` },
    { type: "audience", text: "WOOOOOOOO!" },
    { type: "host", text: `So here's the thing about ${ctx.stageName}. This name? It's ${ctx.nameReason.toLowerCase()}` },
    { type: "host", text: `We're talking ${ctx.genre} with a ${ctx.vibe} energy. This is the kind of artist that doesn't just make music — they create entire worlds.` },
    { type: "audience", text: "YEAH!" },
    { type: "artist", text: `When I first heard the name ${ctx.stageName}, I knew it was mine. It just felt right.` },
    { type: "host", text: `${ctx.stageName} — remember the name, because you're going to hear it everywhere!` },
    { type: "audience", text: "LET'S GOOOO!" },
    { type: "music", text: "OUTRO MUSIC" },
  ];
}
