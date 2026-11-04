import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { brandKitRepository } from "../../../../lib/repositories/brand-kit-repository";
import { displayNameSize, loadPhotoDataUri } from "../../../../lib/media/kit-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// Share cards — downloadable 9:16 story and 1:1 post artwork
// ============================================================
//
// GET /api/share-card/{slug}?format=story|profile
// Rendered on demand with next/og, so the card always uses the latest
// First Take poster and never needs to be stored or regenerated.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const format =
    request.nextUrl.searchParams.get("format") === "profile" ? "profile" : "story";
  const isStory = format === "story";

  const width = 1080;
  const height = isStory ? 1920 : 1080;

  const kit = await brandKitRepository.findBySlug(slug).catch(() => null);
  const top = kit?.names?.[0];
  const name = top?.name || "Your Stage Name";
  const genre = kit?.genre || "";
  const vibe = kit?.vibe || "";
  const meta = [genre, vibe].filter(Boolean).join(" · ");

  const photo = await loadPhotoDataUri(
    kit?.video?.posterUrl ||
      top?.portraitImageUrl ||
      top?.arenaImageUrl ||
      top?.studioPhotoUrl,
    { width, height }
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0B0B0C",
          fontFamily: "sans-serif",
        }}
      >
        {photo ? (
          <img
            alt=""
            src={photo}
            width={width}
            height={height}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width,
              height,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width,
              height,
              background: "linear-gradient(150deg, #F15A38 0%, #1C1D1F 70%)",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width,
            height,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 38%, rgba(0,0,0,0.9) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 64,
            top: 64,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "#F15A38",
              marginRight: 12,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 7,
              color: "#FFFFFF",
              fontWeight: 700,
            }}
          >
            STAGENAME.CLUB
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: isStory ? 130 : 90,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 9,
              color: "#F15A38",
              fontWeight: 700,
            }}
          >
            THE FIRST TAKE
          </div>

          <div
            style={{
              display: "flex",
              fontSize: displayNameSize(name, isStory ? 96 : 78, isStory ? 74 : 60),
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.02,
              marginTop: 18,
            }}
          >
            {name}
          </div>

          {meta ? (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: "rgba(255,255,255,0.65)",
                marginTop: 22,
              }}
            >
              {meta}
            </div>
          ) : null}

          {isStory ? (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "rgba(255,255,255,0.45)",
                marginTop: 48,
              }}
            >
              stagename.club/brand-kit/{slug}
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      width,
      height,
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
