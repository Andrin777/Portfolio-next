import { notFound } from "next/navigation";

import { ProjectView } from "@/components/ProjectView";
import { sanityFetch } from "@/sanity/fetch";
import { projectBySlugQuery, projectSlugsQuery } from "@/sanity/queries";
import type { ProjectDetail } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>(projectSlugsQuery, []);
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await sanityFetch<ProjectDetail | null>(
    projectBySlugQuery,
    null,
    { slug },
  );

  if (!project) notFound();

  return <ProjectView project={project} />;
}
