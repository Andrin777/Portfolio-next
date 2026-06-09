"use client";

import Link from "next/link";

import { imgUrl } from "@/lib/img";
import { loc, useLang } from "@/lib/locale";
import type { ProjectListItem } from "@/lib/types";

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const { lang } = useLang();
  const accent = project.accent || "var(--accent)";
  return (
    <Link
      href={`/work/${project.slug}`}
      className="proj-card"
      style={{ ["--card-accent" as string]: accent }}
    >
      <div className="thumb">
        {project.coverImage?.url && (
          <img
            src={imgUrl(project.coverImage.url, 700)}
            alt={project.title}
            loading="lazy"
          />
        )}
      </div>
      <div className="body">
        <div className="meta">
          <span>{String(project.order ?? "").padStart(2, "0")}</span>
          <span>{project.year}</span>
        </div>
        <h3>{project.title}</h3>
        {project.tag && <span className="tag">{loc(project.tag, lang)}</span>}
        <p className="desc">{loc(project.description, lang)}</p>
      </div>
    </Link>
  );
}
