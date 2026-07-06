import { ImageResponse } from "next/og";

export const alt = "Find Me a Race — India's Race Discovery Platform";
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, opacity: 0.85 }}>
          INDIA&apos;S RACE DISCOVERY PLATFORM
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            marginTop: 24,
          }}
        >
          Find Me a Race
        </div>
        <div style={{ fontSize: 32, marginTop: 24, opacity: 0.9 }}>
          Marathons · Half Marathons · 10Ks · 5Ks · Ultras
        </div>
      </div>
    ),
    { ...size }
  );
}
