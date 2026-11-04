import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("mode") || "ok";

  try {
    if (mode === "sharp") {
      const sharp = (await import("sharp")).default;
      const buffer = await sharp({
        create: { width: 16, height: 16, channels: 3, background: "#F15A38" },
      })
        .png()
        .toBuffer();

      return new Response(new Uint8Array(buffer), {
        headers: { "content-type": "image/png" },
      });
    }

    if (mode === "og") {
      const { ImageResponse } = await import("next/og");

      return new ImageResponse(
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F15A38",
            color: "white",
            fontSize: 48,
          }}
        >
          OG OK
        </div>,
        { width: 200, height: 200 }
      );
    }

    return Response.json({ ok: true, mode });
  } catch (error) {
    return Response.json(
      {
        mode,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    );
  }
}
