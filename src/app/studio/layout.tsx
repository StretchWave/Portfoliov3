import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./studio.css";

export const metadata: Metadata = {
  title: "Atlas Studio | 3D World Scene Editor",
  description: "Visual authoring environment and spatial scene editor for Project Atlas.",
};

export default function StudioRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-zinc-950 text-zinc-100">
      {children}
    </div>
  );
}
