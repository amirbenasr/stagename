import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { artistName, nameReason, genre, vibe } = await req.json();

    if (!artistName || !nameReason) {
      return NextResponse.json(
        { error: "artistName and nameReason are required" },
        { status: 400 }
      );
    }

    const script = generatePodcastScript({
      artistName,
      nameReason,
      genre: genre || "music",
      vibe: vibe || "unique",
    });

    return NextResponse.json({ script });
  } catch (err) {
    console.error("Podcast generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate podcast script" },
      { status: 500 }
    );
  }
}

interface PodcastParams {
  artistName: string;
  nameReason: string;
  genre: string;
  vibe: string;
}

interface PodcastSegment {
  speaker: "host" | "artist" | "audience";
  text: string;
}

function generatePodcastScript({
  artistName,
  nameReason,
  genre,
  vibe,
}: PodcastParams): PodcastSegment[] {
  const segments: PodcastSegment[] = [];

  // Host intro with energy
  segments.push({
    speaker: "host",
    text: `Everybody, welcome with me — the one, the only, ${artistName}!`,
  });

  // Audience cheer
  segments.push({
    speaker: "audience",
    text: "WOOOOOOOO!",
  });

  // Host talks about the artist
  segments.push({
    speaker: "host",
    text: `So here's the thing about ${artistName}. This name? It's not just random. It's ${nameReason.toLowerCase()}`,
  });

  // More host hype
  segments.push({
    speaker: "host",
    text: `We're talking ${genre} with a ${vibe} energy. This is the kind of artist that doesn't just make music — they create entire worlds.`,
  });

  // Audience reaction
  segments.push({
    speaker: "audience",
    text: "YEAH!",
  });

  // // Artist responds (cool, confident)
  // segments.push({
  //   speaker: "artist",
  //   text: `You know, when I first heard the name ${artistName}, I knew it was mine. It just felt right — like it was waiting for me.`,
  // });

  // // Host wraps up
  // segments.push({
  //   speaker: "host",
  //   text: `${artistName} — remember the name, because you're going to hear it everywhere. Let's get into it!`,
  // });

  // // Final audience cheer
  // segments.push({
  //   speaker: "audience",
  //   text: "WOOOOO! LET'S GO!",
  // });

  return segments;
}
