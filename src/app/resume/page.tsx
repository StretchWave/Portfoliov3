import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ResumeView } from "@/features/portfolio/resume/resume-view";

export const metadata: Metadata = {
  title: "Engineering Dossier & Resume",
  description:
    "Print-optimized 2-page engineering resume and machine-readable JSON Resume schema export for Mohammed Mishal — Computer Engineering student building software, intelligent, and interactive systems.",
};

export default function ResumePage() {
  return (
    <PageShell>
      <section className="section-wrap resume-page">
        <header className="page-header resume-page-header">
          <p className="eyebrow">ENGINEERING DOSSIER · PRINT & ATS PARSER READY</p>
          <h1>Resume & Engineering Dossier</h1>
          <p className="lead">
            High-fidelity 2-page print-optimized engineering resume, standard JSON Resume schema export, and plaintext
            ATS parser output backed by verified production projects and evidence-based skills.
          </p>
        </header>

        <ResumeView />
      </section>
    </PageShell>
  );
}
