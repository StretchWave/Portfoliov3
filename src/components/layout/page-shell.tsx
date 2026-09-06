import type { ReactNode } from "react";

import { SiteHeader } from "./site-header";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="site-frame">
      <SiteHeader />
      <main>{children}</main>
      <footer className="site-footer">Project Atlas — a portfolio foundation built to evolve.</footer>
    </div>
  );
}
