import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { ProjectDetails } from "@/features/portfolio/components/project-details";
import { getAllProjects, getProjectBySlug } from "@/features/portfolio/project-registry";

export function generateStaticParams() {
  return getAllProjects().map((project) => ({
    slug: project.slug,
  }));
}

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  return project
    ? { title: project.name, description: project.summary }
    : { title: "Project not found" };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <PageShell>
      <div className="section-wrap"><ProjectDetails project={project} /></div>
    </PageShell>
  );
}
