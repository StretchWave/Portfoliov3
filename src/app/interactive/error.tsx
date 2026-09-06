"use client";

import Link from "next/link";

export default function InteractiveError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="interactive-route-fallback">
      <p className="eyebrow">Interactive hub unavailable</p>
      <h1>The 3D experience could not start.</h1>
      <p>The conventional portfolio remains fully available.</p>
      <div className="button-row">
        <button className="button button--primary" onClick={reset}>Try again</button>
        <Link className="button button--quiet" href="/projects">Browse projects</Link>
      </div>
    </main>
  );
}
