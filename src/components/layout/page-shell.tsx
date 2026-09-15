import Link from "next/link";
import type { ReactNode } from "react";

import { profile } from "@/data/profile";

import { SiteHeader } from "./site-header";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="site-frame">
      <SiteHeader />
      <main>{children}</main>
      <footer className="site-footer">
        <span>{profile.name} — Project Atlas.</span>
        <span className="site-footer__links">
          {profile.links.map((link) => (
            <Link key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</Link>
          ))}
        </span>
      </footer>
    </div>
  );
}
