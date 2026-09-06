import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";

export default function NotFound() {
  return (
    <PageShell>
      <section className="section-wrap empty-state">
        <p className="eyebrow">404</p>
        <h1>That route is not on the Atlas map.</h1>
        <Link className="button button--primary" href="/">Return home</Link>
      </section>
    </PageShell>
  );
}
