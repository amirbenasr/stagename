import { NextRequest, NextResponse } from "next/server";
import { getTTSProvider } from "@/lib/tts";

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const provider = getTTSProvider();
    if (!provider) {
      return NextResponse.json(
        { error: "TTS not configured — use browser fallback" },
        { status: 501 }
      );
    }

    const { audio, contentType } = await provider.synthesize(text, voiceId);

    return new NextResponse(new Uint8Array(audio), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("TTS error:", message, err);
    return NextResponse.json(
      { error: `TTS synthesis failed: ${message}` },
      { status: 500 }
    );
  }
}
