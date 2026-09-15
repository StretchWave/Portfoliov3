import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { profile } from "@/data/profile";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Project Atlas | Mohammed Mishal",
    template: "%s | Project Atlas",
  },
  description: "A web-native interactive portfolio for software, intelligent, and interactive systems by Mohammed Mishal.",
  openGraph: {
    title: "Project Atlas | Mohammed Mishal",
    description: "A web-native interactive portfolio for software, intelligent, and interactive systems.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Atlas | Mohammed Mishal",
    description: "A web-native interactive portfolio for software, intelligent, and interactive systems.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07111f",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  description: profile.introShort,
  sameAs: profile.links.map((l) => l.href),
};

import { DiscoveryJournalProvider } from "@/features/portfolio/journal/discovery-journal-context";
import { DiscoveryJournalModal } from "@/features/portfolio/journal/discovery-journal-modal";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <DiscoveryJournalProvider>
          {children}
          <DiscoveryJournalModal />
        </DiscoveryJournalProvider>
      </body>
    </html>
  );
}
