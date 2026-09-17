import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";
import { getAllProjects } from "@/features/portfolio/project-registry";
import { WORLD_AREAS } from "@/data/world-areas";
import { SITE_CONFIG } from "@/lib/site-config";

export const alt = "Project Atlas — Mohammed Mishal | Systems & Interactive Worlds";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const projectCount = getAllProjects().length;
  const districtCount = Object.keys(WORLD_AREAS).length;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #07111f 0%, #0c1a2e 50%, #07111f 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#f8fafc",
          position: "relative",
        }}
      >
        {/* Background Ambient Glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
          }}
        />

        {/* Top Brand Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 12L12 22L2 12Z" fill="#38bdf8" />
            </svg>
            <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "0.15em", color: "#68e4ff" }}>
              PROJECT ATLAS
            </span>
          </div>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(104, 228, 255, 0.12)",
              border: "1px solid rgba(104, 228, 255, 0.3)",
              fontSize: "14px",
              fontWeight: 600,
              color: "#38bdf8",
              letterSpacing: "0.08em",
            }}
          >
            SYSTEMS ARCHITECTURE & 3D HUB
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "auto 0" }}>
          <span style={{ fontSize: "22px", fontWeight: 600, color: "#818cf8", letterSpacing: "0.05em" }}>
            {profile.roleEyebrow}
          </span>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.1,
              color: "#ffffff",
            }}
          >
            {profile.name}
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              margin: 0,
              lineHeight: 1.4,
              maxWidth: "920px",
            }}
          >
            {profile.title}
          </p>
        </div>

        {/* Footer Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <span style={{ fontSize: "16px", color: "#64748b" }}>{projectCount} Projects</span>
            <span style={{ fontSize: "16px", color: "#334155" }}>|</span>
            <span style={{ fontSize: "16px", color: "#64748b" }}>{districtCount} Interactive Districts</span>
            <span style={{ fontSize: "16px", color: "#334155" }}>|</span>
            <span style={{ fontSize: "16px", color: "#64748b" }}>WebGL & Web Audio</span>
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#38bdf8" }}>
            {SITE_CONFIG.url.replace(/^https?:\/\//, "")}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
