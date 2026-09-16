import { ImageResponse } from "next/og";
import { getAllProjects, getProjectBySlug } from "@/features/portfolio/project-registry";
import type { PortfolioProject } from "@/types/portfolio";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllProjects().map((p: PortfolioProject) => ({ slug: p.slug }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  const title = project?.name || "Project Case Study";
  const summary = project?.summary || "Systems Engineering & Architectural Breakdown";
  const category = project?.category ? project.category.replaceAll("-", " ") : "Engineering System";
  const tech: readonly string[] = project?.technologies.slice(0, 4) || [];

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
          background: "linear-gradient(135deg, #07111f 0%, #0c1a2e 60%, #07111f 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#f8fafc",
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
          }}
        />

        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 12L12 22L2 12Z" fill="#38bdf8" />
            </svg>
            <span style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "0.12em", color: "#68e4ff" }}>
              PROJECT ATLAS
            </span>
          </div>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "16px",
              background: "rgba(129, 140, 248, 0.15)",
              border: "1px solid rgba(129, 140, 248, 0.35)",
              fontSize: "14px",
              fontWeight: 700,
              color: "#c7d2fe",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {category}
          </div>
        </div>

        {/* Center Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", margin: "auto 0" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              margin: 0,
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            {title}
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
            {summary}
          </p>
        </div>

        {/* Footer: Tech Stack Chips & Author */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            {tech.map((t: string) => (
              <span
                key={t}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  fontSize: "14px",
                  color: "#cbd5e1",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#38bdf8" }}>
            Mohammed Mishal · Architecture Portfolio
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
