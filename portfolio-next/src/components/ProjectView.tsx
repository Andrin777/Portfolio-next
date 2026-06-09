"use client";

import Link from "next/link";

import { MediaBlocks } from "@/components/MediaBlocks";
import { imgUrl } from "@/lib/img";
import { loc, useLang } from "@/lib/locale";
import type { ProjectDetail } from "@/lib/types";

const T = {
  back: { en: "← Back to work", de: "← Zurück zu den Arbeiten" },
  highlights: { en: "Highlights", de: "Highlights" },
};

export function ProjectView({ project }: { project: ProjectDetail }) {
  const { lang } = useLang();
  const accent = project.accent || "var(--accent)";

  return (
    <main style={{ ["--accent" as string]: accent }}>
      <section className="proj-hero px">
        <div className="wrap">
          <Link href="/#work" className="back-link">
            {T.back[lang]}
          </Link>
          {project.tag && <p className="eyebrow" style={{ marginTop: 24 }}>{loc(project.tag, lang)}</p>}
          <h1>{project.title}</h1>
          {project.titleSub && <p className="titleSub">{project.titleSub}</p>}
          {project.intro && <p className="lead">{loc(project.intro, lang)}</p>}

          <div style={{ display: "flex", gap: 18, marginTop: 20, flexWrap: "wrap", color: "var(--muted)", fontSize: 13 }}>
            {project.year && <span>{project.year}</span>}
            {project.topic?.label && <span>· {loc(project.topic.label, lang)}</span>}
          </div>
        </div>
      </section>

      {project.coverImage?.url && (
        <div className="px">
          <div className="wrap">
            <div className="proj-cover">
              <img src={imgUrl(project.coverImage.url, 1600)} alt={project.title} />
            </div>
          </div>
        </div>
      )}

      {project.mediaIntro &&
        (project.mediaIntro.heading || project.mediaIntro.brief) && (
          <section className="px">
            <div className="wrap" style={{ paddingBlock: 24, maxWidth: 760 }}>
              {project.mediaIntro.eyebrow && (
                <p className="eyebrow">{loc(project.mediaIntro.eyebrow, lang)}</p>
              )}
              {project.mediaIntro.heading && (
                <h2 style={{ fontSize: "clamp(24px,4vw,40px)", margin: "0 0 16px" }}>
                  {loc(project.mediaIntro.heading, lang)}
                </h2>
              )}
              {project.mediaIntro.brief && (
                <p className="muted" style={{ lineHeight: 1.6, fontSize: 16 }}>
                  {loc(project.mediaIntro.brief, lang)}
                </p>
              )}
            </div>
          </section>
        )}

      <section className="px">
        <div className="wrap">
          <MediaBlocks blocks={project.mediaBlocks} />
        </div>
      </section>

      {project.highlights && project.highlights.length > 0 && (
        <section className="block px">
          <div className="wrap">
            <p className="eyebrow">{T.highlights[lang]}</p>
            <div className="highlights" style={{ marginTop: 20 }}>
              {project.highlights.map((h, i) => (
                <div className="highlight" key={i} style={{ borderColor: "var(--line)" }}>
                  <h4 style={{ color: accent }}>{loc(h.title, lang)}</h4>
                  <p>{loc(h.body, lang)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {project.flipbookUrl && (
        <section className="px">
          <div className="wrap media-embed" style={{ paddingBottom: 64 }}>
            <iframe
              src={project.flipbookUrl}
              loading="lazy"
              style={{ aspectRatio: "16/10" }}
              allowFullScreen
            />
          </div>
        </section>
      )}

      <footer className="footer px">
        <Link href="/#work" className="back-link">
          {T.back[lang]}
        </Link>
      </footer>
    </main>
  );
}
