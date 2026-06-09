"use client";

import { ProjectCard } from "@/components/ProjectCard";
import { loc, useLang } from "@/lib/locale";
import type { ProjectListItem, SiteSettings, StackItem } from "@/lib/types";

const T = {
  workEyebrow: { en: "(01) — Selected work", de: "(01) — Ausgewählte Arbeiten" },
  workTitle: { en: "Things I made.", de: "Was ich gemacht habe." },
  aboutEyebrow: { en: "(02) — About me", de: "(02) — Über mich" },
  stackEyebrow: { en: "(03) — Tech stack", de: "(03) — Tech Stack" },
  stackTitle: { en: "Tools I work with.", de: "Womit ich arbeite." },
  contactEyebrow: { en: "(04) — Contact", de: "(04) — Kontakt" },
  viewWork: { en: "View selected work", de: "Ausgewählte Arbeiten" },
  dropLine: { en: "Drop me a line", de: "Schreib mir" },
};

export function HomeView({
  settings,
  projects,
  stack,
}: {
  settings: SiteSettings;
  projects: ProjectListItem[];
  stack: StackItem[];
}) {
  const { lang } = useLang();

  return (
    <main>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <header className="hero px">
        <div className="wrap">
          {settings?.status && (
            <span className="status-pill">{loc(settings.status, lang)}</span>
          )}
          <h1 style={{ whiteSpace: "pre-line" }}>{loc(settings?.heroTitle, lang)}</h1>
          <p className="lead">{loc(settings?.heroLead, lang)}</p>
          <div className="btn-row">
            <a href="#work" className="btn btn-primary">
              {T.viewWork[lang]} →
            </a>
            {settings?.email && (
              <a href={`mailto:${settings.email}`} className="btn">
                {T.dropLine[lang]}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Work ───────────────────────────────────────────────────────── */}
      <section id="work" className="block px">
        <div className="wrap">
          <div className="section-head">
            <div className="lhs">
              <p className="eyebrow">{T.workEyebrow[lang]}</p>
              <h2>{T.workTitle[lang]}</h2>
            </div>
          </div>
          <div className="proj-grid">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────────────── */}
      <section id="about" className="block px">
        <div className="wrap">
          <p className="eyebrow">{T.aboutEyebrow[lang]}</p>
          <div className="cols-2">
            <div>
              <h2 style={{ fontSize: "clamp(28px,4vw,44px)", margin: "0 0 20px" }}>
                {loc(settings?.aboutTitle, lang)}
              </h2>
              <p className="bio">{loc(settings?.aboutBio, lang)}</p>
            </div>
            <div className="now-grid">
              {settings?.now?.map((card, i) => (
                <div className="now-card" key={i}>
                  <div className="label">{loc(card.label, lang)}</div>
                  <div>{loc(card.text, lang)}</div>
                </div>
              ))}
            </div>
          </div>

          {settings?.journey && settings.journey.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <p className="eyebrow">{loc(settings.journeyEyebrow, lang)}</p>
              <h3 style={{ fontSize: "clamp(22px,3vw,32px)", margin: "0 0 20px" }}>
                {loc(settings.journeyTitle, lang)}
              </h3>
              <div className="timeline">
                {settings.journey.map((row, i) => (
                  <div className="timeline-row" key={i}>
                    <div className="year">{row.year}</div>
                    <div>
                      <h4>{loc(row.title, lang)}</h4>
                      <p className="place">{loc(row.place, lang)}</p>
                      <p className="body">{loc(row.body, lang)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Stack ──────────────────────────────────────────────────────── */}
      {stack.length > 0 && (
        <section id="stack" className="block px">
          <div className="wrap">
            <div className="section-head">
              <div className="lhs">
                <p className="eyebrow">{T.stackEyebrow[lang]}</p>
                <h2>{T.stackTitle[lang]}</h2>
              </div>
            </div>
            <div className="stack-grid">
              {stack.map((tool) => (
                <div className="stack-card" key={tool._id}>
                  <div
                    className="stack-icon"
                    style={{ background: tool.color || "#333" }}
                    dangerouslySetInnerHTML={{ __html: tool.icon || tool.name[0] }}
                  />
                  <div>
                    <div className="name">{tool.name}</div>
                    <div className="sub">{loc(tool.description, lang)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact ────────────────────────────────────────────────────── */}
      <section id="contact" className="block px contact">
        <div className="wrap">
          <p className="eyebrow">{T.contactEyebrow[lang]}</p>
          <h2 style={{ whiteSpace: "pre-line" }}>{loc(settings?.contactTitle, lang)}</h2>
          {settings?.email && (
            <a className="mail" href={`mailto:${settings.email}`}>
              {settings.email}
            </a>
          )}
          {settings?.socials && (
            <div className="socials">
              {settings.socials.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer">
                  {s.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="footer px">
        <span>{loc(settings?.footerText, lang)}</span>
        <span>Made with Next.js + Sanity</span>
      </footer>
    </main>
  );
}
