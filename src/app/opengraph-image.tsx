import { ImageResponse } from "next/og";
import { SITE_NAME_EN, SITE_NAME_KO, SITE_TAGLINE_KO } from "@/lib/site";

export const runtime = "edge";
export const alt = SITE_NAME_KO;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px 72px",
          background: "linear-gradient(145deg, #001F3F 0%, #0A2A4A 55%, #0A3A5C 100%)",
          color: "#F7F3EB",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 120,
            width: 280,
            height: 280,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(230,195,92,0.35) 0%, rgba(230,195,92,0) 70%)",
          }}
        />
        <div
          style={{
            fontSize: 54,
            fontWeight: 700,
            color: "#E6C35C",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          {SITE_NAME_KO}
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#E8D89A",
            marginBottom: 28,
            letterSpacing: "0.04em",
          }}
        >
          {SITE_NAME_EN}
        </div>
        <div style={{ fontSize: 28, maxWidth: 760, lineHeight: 1.4 }}>
          {SITE_TAGLINE_KO}
        </div>
      </div>
    ),
    { ...size },
  );
}
