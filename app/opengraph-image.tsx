import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "stagename.club — you already have a stage name";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F7F4EF",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "#F15A38",
              marginRight: 16,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 8,
              color: "#1C1D1F",
              fontWeight: 700,
            }}
          >
            STAGENAME.CLUB
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 700,
              color: "#1C1D1F",
              lineHeight: 1.02,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            You already have a stage name.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#656B73",
              marginTop: 26,
            }}
          >
            3 names · 12 images · 1 first take
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 5,
              color: "#F15A38",
              fontWeight: 700,
            }}
          >
            ONE-TIME · YOURS TO KEEP
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#1C1D1F" }}>
            stagename.club
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
