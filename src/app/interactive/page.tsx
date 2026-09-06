import type { Metadata } from "next";

import { InteractivePortfolioShell } from "./interactive-portfolio-shell";

export const metadata: Metadata = {
  title: "Interactive Hub",
  description: "An optional WebGL exploration of the Project Atlas portfolio.",
};

export default function InteractivePage() {
  return <InteractivePortfolioShell />;
}
