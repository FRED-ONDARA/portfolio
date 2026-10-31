import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = site.seo.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#F5F3EF",
        color: "#0C0C0D",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#6B6B70", letterSpacing: 2 }}
      >
        <span>{site.initials}</span>
        <span>NAIROBI, KENYA</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 112,
          fontWeight: 700,
          letterSpacing: -5,
          lineHeight: 0.95,
        }}
      >
        <span>Building what</span>
        <span style={{ color: "#FF5710" }}>connects.</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 26,
          borderTop: "2px solid #0C0C0D",
          paddingTop: 24,
        }}
      >
        <span>{site.name}</span>
        <span style={{ color: "#6B6B70" }}>Electrical & Electronic Engineering · Telecom</span>
      </div>
    </div>,
    size,
  );
}
