"use client";

import Link from "next/link";
import { useEffect } from "react";

import { MediaBlocks } from "@/components/MediaBlocks";
import { imgUrl } from "@/lib/img";
import { loc, useLang } from "@/lib/locale";
import type { ProjectDetail } from "@/lib/types";

export function ProjectView({ project }: { project: ProjectDetail }) {
  const { lang } = useLang();
  const t = (en: string, de: string) => (lang === "de" ? de : en);
  const accent = project.accent || "var(--accent)";
  const num = String(project.order ?? "").padStart(2, "0");
  const tag = loc(project.tag, lang);

  // Mirror the legacy `data-active-project` flag so per-project CSS tweaks
  // (e.g. Dynamik's near-black accent legibility fix) keep working.
  useEffect(() => {
    document.body.dataset.activeProject = project.slug;
    return () => {
      document.body.dataset.activeProject = "";
    };
  }, [project.slug]);

  const coverUrl = imgUrl(project.coverImage?.url, 1800);
  const coverBg = coverUrl
    ? `linear-gradient(to bottom, rgba(0,0,0,.05) 0%, rgba(0,0,0,.5) 100%), url('${coverUrl}') center/cover no-repeat, ${accent}`
    : accent;

  const hasMediaHead =
    project.mediaIntro &&
    (project.mediaIntro.eyebrow ||
      project.mediaIntro.heading ||
      project.mediaIntro.brief);
  const hasMedia = hasMediaHead || (project.mediaBlocks?.length ?? 0) > 0;

  return (
    <div className="shell project-page-route">
      <div className="px">
        <Link className="proj-back" href="/#work">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>{t("Back to portfolio", "Zurück zum Portfolio")}</span>
        </Link>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="proj-hero px">
        <p className="eyebrow">
          {num ? `(${num}) — ` : ""}
          {tag?.toUpperCase()}
        </p>
        <h1>
          {project.title}
          {project.titleSub && (
            <span className="title-jp-sub">{project.titleSub}</span>
          )}
        </h1>
        {project.description && (
          <p className="lead">{loc(project.description, lang)}</p>
        )}
        <div className="proj-meta">
          {project.year && <span>{project.year}</span>}
          {project.year && (project.topic?.label || tag) && <span>·</span>}
          <span>{loc(project.topic?.label, lang) || tag}</span>
        </div>
      </section>

      {/* ── Cover ─────────────────────────────────────────────────────── */}
      <section className="px">
        <div className="proj-cover" style={{ background: coverBg }}>
          <span className="cover-num">{num}</span>
        </div>
      </section>

      {/* ── Media ─────────────────────────────────────────────────────── */}
      {hasMedia && (
        <section className="proj-media px">
          {hasMediaHead && (
            <div className="proj-media-head">
              <p className="eyebrow">
                {loc(project.mediaIntro?.eyebrow, lang) ||
                  t("PROCESS", "PROZESS")}
              </p>
              <div>
                {project.mediaIntro?.heading && (
                  <h2>{loc(project.mediaIntro.heading, lang)}</h2>
                )}
                {project.mediaIntro?.brief && (
                  <p className="body">{loc(project.mediaIntro.brief, lang)}</p>
                )}
              </div>
            </div>
          )}
          <MediaBlocks blocks={project.mediaBlocks} />
        </section>
      )}

      {/* ── Flipbook ──────────────────────────────────────────────────── */}
      {project.flipbookUrl && (
        <section className="proj-flipbook px">
          <div className="head">
            <div>
              <p className="eyebrow">{t("BROCHURE", "BROSCHÜRE")}</p>
              <h2>{t("Flip through it.", "Durchblättern.")}</h2>
            </div>
            <p className="hint">
              {t(
                "Interactive brochure — drag or click the page corners to turn.",
                "Interaktive Broschüre — zieh oder klick an den Seitenecken zum Blättern.",
              )}
            </p>
          </div>
          <div className="proj-flipbook-frame">
            <iframe
              src={project.flipbookUrl}
              loading="lazy"
              allow="fullscreen"
              title={`${project.title} brochure`}
            />
          </div>
        </section>
      )}

      {/* ── About ─────────────────────────────────────────────────────── */}
      {project.intro && (
        <section className="proj-about px">
          <div className="proj-about-grid">
            <p className="eyebrow">
              {t("ABOUT THIS PROJECT", "ÜBER DIESES PROJEKT")}
            </p>
            <p className="body">{loc(project.intro, lang)}</p>
          </div>
        </section>
      )}

      {/* ── Highlights ────────────────────────────────────────────────── */}
      {project.highlights && project.highlights.length > 0 && (
        <section className="proj-highlights px">
          <div className="proj-hl-grid">
            {project.highlights.map((h, i) => (
              <div
                className="proj-hl-card"
                key={i}
                style={{ borderTopColor: accent }}
              >
                <p className="proj-hl-num" style={{ color: accent }}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3>{loc(h.title, lang)}</h3>
                <p>{loc(h.body, lang)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
