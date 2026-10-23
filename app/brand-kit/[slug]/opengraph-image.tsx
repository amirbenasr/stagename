import { ImageResponse } from "next/og";
import { brandKitRepository } from "../../../lib/repositories/brand-kit-repository";
import { displayNameSize, loadPhotoDataUri } from "../../../lib/media/kit-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "A debut artist kit from stagename.club";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const kit = await brandKitRepository.findBySlug(slug).catch(() => null);
  const top = kit?.names?.[0];
  const name = top?.name || "Your Stage Name";
  const genre = kit?.genre || "";
  const vibe = kit?.vibe || "";

  const photo = await loadPhotoDataUri(
    kit?.video?.posterUrl ||
      top?.portraitImageUrl ||
      top?.arenaImageUrl ||
      top?.studioPhotoUrl,
    { width: 900, height: 1200 }
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#F7F4EF",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 470,
            height: 630,
            display: "flex",
            backgroundColor: "#1C1D1F",
            background: "linear-gradient(160deg, #F15A38 0%, #1C1D1F 100%)",
            overflow: "hidden",
          }}
        >
          {photo ? (
            <img
              alt=""
              src={photo}
              width={470}
              height={630}
              style={{ width: 470, height: 630, objectFit: "cover" }}
            />
          ) : null}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "54px 60px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 6,
              color: "#F15A38",
              fontWeight: 700,
            }}
          >
            STAGENAME.CLUB
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 16,
                letterSpacing: 6,
                color: "#F15A38",
                fontWeight: 700,
              }}
            >
              THE FIRST TAKE
            </div>
            <div
              style={{
                display: "flex",
                fontSize: displayNameSize(name, 82, 60),
                fontWeight: 700,
                color: "#1C1D1F",
                lineHeight: 1.02,
                marginTop: 14,
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "#656B73",
                marginTop: 18,
              }}
            >
              {[genre, vibe].filter(Boolean).join(" · ")}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "#1C1D1F",
            }}
          >
            3 names · 12 images · 1 first take
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
