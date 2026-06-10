"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { imgUrl } from "@/lib/img";
import { initHomeInteractions } from "@/lib/homeInteractions";
import { loc, useLang } from "@/lib/locale";
import type {
  Locale,
  ProjectListItem,
  SiteSettings,
  StackItem,
  ToolReceipt,
} from "@/lib/types";

type WorkMode = "spiral" | "list";
type StackView = "receipts" | "cards";

export function HomeView({
  settings,
  projects,
  stack,
  toolReceipts,
}: {
  settings: SiteSettings;
  projects: ProjectListItem[];
  stack: StackItem[];
  toolReceipts: ToolReceipt[];
}) {
  const { lang, toggle } = useLang();
  const t = (en: string, de: string) => (lang === "de" ? de : en);
  const L = (v?: Locale) => loc(v, lang);

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [workMode, setWorkMode] = useState<WorkMode>("spiral");
  const [showAll, setShowAll] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeYear, setActiveYear] = useState("all");
  const [activeTopic, setActiveTopic] = useState("all");
  const [openTimeline, setOpenTimeline] = useState(0);
  const [stackView, setStackView] = useState<StackView>("receipts");

  /* ── Theme: restore + mirror to <html>/<body> ──────────────────────── */
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("aa-theme");
    } catch {
      /* ignore */
    }
    if (!saved) {
      saved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    setTheme(saved === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    try {
      localStorage.setItem("aa-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  /* ── Default to list view on small screens ─────────────────────────── */
  useEffect(() => {
    if (window.matchMedia("(max-width: 640px)").matches) setWorkMode("list");
  }, []);

  /* ── Wire up the ported imperative interactions once ───────────────── */
  useEffect(() => {
    const cleanup = initHomeInteractions();
    return cleanup;
  }, []);

  /* ── Filter options derived from the project list ──────────────────── */
  const years = useMemo(
    () =>
      Array.from(new Set(projects.map((p) => p.year).filter(Boolean))).sort(
        (a, b) => String(b).localeCompare(String(a)),
      ) as string[],
    [projects],
  );
  const topics = useMemo(() => {
    const map = new Map<string, Locale>();
    projects.forEach((p) => {
      if (p.topic?.key) map.set(p.topic.key, p.topic.label);
    });
    return Array.from(map.entries());
  }, [projects]);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (activeYear === "all" || p.year === activeYear) &&
          (activeTopic === "all" || p.topic?.key === activeTopic),
      ),
    [projects, activeYear, activeTopic],
  );

  const hasActiveFilters = activeYear !== "all" || activeTopic !== "all";
  const spiral = workMode === "spiral";
  const visible = spiral
    ? filtered
    : showAll || hasActiveFilters
      ? filtered
      : filtered.slice(0, 6);

  /* ── Re-run the spiral layout when its contents change ─────────────── */
  useEffect(() => {
    const fn = (window as unknown as { __spiralUpdate?: () => void })
      .__spiralUpdate;
    if (spiral && fn) fn();
  }, [spiral, visible.length, lang]);

  const filterCount =
    (activeYear !== "all" ? 1 : 0) + (activeTopic !== "all" ? 1 : 0);

  return (
    <div className="shell main-page">
      {/* ── NAV ───────────────────────────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-inner px">
          <p className="logo">ANDRIN ✦</p>

          <div className="nav-links hide-mobile">
            <a className="link" href="#work">
              {t("Work", "Arbeiten")}
            </a>
            <a className="link" href="#about">
              {t("About", "Über mich")}
            </a>
            <a className="link" href="#contact">
              {t("Contact", "Kontakt")}
            </a>

            <button
              className="lang-btn"
              onClick={toggle}
              aria-label="Toggle language"
            >
              <span className="lang-de">DE</span>
              <span className="sep">/</span>
              <span className="lang-en">EN</span>
            </button>

            <button
              className="icon-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          <div
            className="hide-desktop"
            style={{ alignItems: "center", gap: 8 }}
          >
            <button
              className="lang-btn"
              onClick={toggle}
              aria-label="Toggle language"
            >
              <span className="lang-de">DE</span>
              <span className="sep">/</span>
              <span className="lang-en">EN</span>
            </button>
            <button
              className="icon-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              className="icon-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        <div className={`menu-mobile${menuOpen ? " open" : ""}`}>
          <a className="link" href="#work" onClick={() => setMenuOpen(false)}>
            {t("Work", "Arbeiten")}
          </a>
          <a className="link" href="#about" onClick={() => setMenuOpen(false)}>
            {t("About", "Über mich")}
          </a>
          <a
            className="link"
            href="#contact"
            onClick={() => setMenuOpen(false)}
          >
            {t("Contact", "Kontakt")}
          </a>
        </div>
      </nav>

      {/* ── NAME INTRO ────────────────────────────────────────────────── */}
      <section className="name-intro" id="nameIntro" aria-label="Andrin">
        <canvas
          id="nameCanvas"
          className="name-intro-canvas"
          aria-hidden="true"
        />
        <div className="name-intro-hint">
          <span>{t("scroll to explore", "weiter scrollen")}</span>
        </div>
      </section>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="hero px" id="hero">
        <div className="hero-aurora" aria-hidden="true" />

        <p className="eyebrow hero-eyebrow">
          {t(
            "INTERACTION DESIGNER · BASED IN ZÜRICH",
            "INTERACTION DESIGNER · MIT SITZ IN ZÜRICH",
          )}
        </p>

        <div className="hero-grid">
          <div>
            {/* Both titles render so the typewriter caret coords stay aligned
                across a mid-animation language switch; CSS hides the inactive
                one via [data-lang]. */}
            <h1 id="heroTitle" data-en>
              {settings?.heroTitle?.en ||
                "Designing thoughtful, playful systems for humans, machines & everything in between."}
            </h1>
            <h1 id="heroTitleDe" data-de>
              {settings?.heroTitle?.de ||
                "Durchdachte, verspielte Systeme für Menschen, Maschinen & alles dazwischen."}
            </h1>

            <p className="lead">
              {L(settings?.heroLead) ||
                t(
                  "I'm Andrin — a Bachelor student in Interaction Design at ZHdK Zürich, working at the intersection of design, code, and concept.",
                  "Ich bin Andrin — Bachelorstudent für Interaction Design an der ZHdK Zürich, an der Schnittstelle von Design, Code und Konzept.",
                )}
            </p>

            <div className="hero-ctas">
              <a className="btn btn-primary magnetic" href="#work" data-magnetic>
                <span>{t("View selected work", "Ausgewählte Arbeiten")}</span>
                <span>→</span>
              </a>
              <a
                className="btn btn-ghost magnetic"
                href="#contact"
                data-magnetic
              >
                <span>{t("Drop me a line", "Schreib mir")}</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────────── */}
      <div className="marquee">
        <div className="marquee-track">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i}>
              {t(
                "INTERACTION DESIGN  ✦  CREATIVE CODING  ✦  CONCEPT  ✦  RESEARCH  ✦  AR  ✦  TYPOGRAPHY",
                "INTERACTION DESIGN  ✦  CREATIVE CODING  ✦  KONZEPT  ✦  RESEARCH  ✦  AR  ✦  TYPOGRAFIE",
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ── SELECTED WORK ─────────────────────────────────────────────── */}
      <section
        id="work"
        className={`block px${spiral ? " work-spiral" : ""}`}
      >
        <div className="work-bg-text-wrap" aria-hidden="true">
          <span className="work-bg-text">Selected Works</span>
        </div>
        <div className="section-head">
          <div className="lhs">
            <p className="eyebrow">
              {t("(01) — SELECTED WORK", "(01) — AUSGEWÄHLTE ARBEITEN")}
            </p>
            <h2>{t("Things I made.", "Was ich gemacht habe.")}</h2>
          </div>
          <div className="rhs">
            <p>
              {t(
                "Projects spanning interaction design, creative code, and physical computing — from AR travel apps to combat robots.",
                "Projekte aus Interaction Design, Creative Code und Physical Computing — von AR-Reise-Apps bis zu Kampfrobotern.",
              )}
            </p>
            <div className="work-filter-wrap">
              <button
                className={`work-filter-toggle${filterOpen ? " is-open" : ""}`}
                type="button"
                aria-expanded={filterOpen}
                onClick={() => setFilterOpen((o) => !o)}
              >
                <span>{t("Filter", "Filter")}</span>
                {filterCount > 0 && <span className="count">{filterCount}</span>}
              </button>
              <div className="work-filter-panel" hidden={!filterOpen}>
                <div className="work-filter-group">
                  <p className="work-filter-label">{t("Year", "Jahr")}</p>
                  <div className="work-filter-chips">
                    <FilterChip
                      active={activeYear === "all"}
                      label={t("All", "Alle")}
                      onClick={() => setActiveYear("all")}
                    />
                    {years.map((y) => (
                      <FilterChip
                        key={y}
                        active={activeYear === y}
                        label={y}
                        onClick={() => setActiveYear(y)}
                      />
                    ))}
                  </div>
                </div>
                <div className="work-filter-group">
                  <p className="work-filter-label">{t("Topic", "Oberthema")}</p>
                  <div className="work-filter-chips">
                    <FilterChip
                      active={activeTopic === "all"}
                      label={t("All", "Alle")}
                      onClick={() => setActiveTopic("all")}
                    />
                    {topics.map(([key, label]) => (
                      <FilterChip
                        key={key}
                        active={activeTopic === key}
                        label={L(label) || key}
                        onClick={() => setActiveTopic(key)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="work-view-switch" role="tablist" aria-label="Work view">
          <button
            className={`work-view-btn${spiral ? " active" : ""}`}
            type="button"
            role="tab"
            aria-selected={spiral}
            onClick={() => setWorkMode("spiral")}
          >
            spiral
          </button>
          <span className="sep" aria-hidden="true" />
          <button
            className={`work-view-btn${!spiral ? " active" : ""}`}
            type="button"
            role="tab"
            aria-selected={!spiral}
            onClick={() => setWorkMode("list")}
          >
            list
          </button>
        </div>

        {spiral ? (
          <div className="work-spiral-scroll" id="projGrid">
            <div className="work-spiral-stage">
              {visible.map((p) => (
                <SpiralCard key={p._id} p={p} title={cardTitle(p, lang)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="proj-grid" id="projGrid">
            {visible.map((p) => (
              <ProjCard
                key={p._id}
                p={p}
                title={cardTitle(p, lang)}
                tag={L(p.tag)}
                desc={L(p.description)}
                more={t("View case study →", "Case Study ansehen →")}
              />
            ))}
          </div>
        )}

        {!spiral && !hasActiveFilters && (
          <div className="show-more-row">
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn btn-ghost"
                onClick={() => setShowAll((s) => !s)}
              >
                <span className="show-text">
                  {showAll
                    ? t("Show less", "Weniger anzeigen")
                    : t("Show all works", "Alle Arbeiten anzeigen")}
                </span>
                {!showAll && (
                  <span className="show-count"> ({filtered.length})</span>
                )}
                <span
                  className="chev"
                  style={{
                    transition: "transform .3s ease",
                    transform: showAll ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ↓
                </span>
              </button>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>
              {showAll
                ? t(
                    `Showing all ${filtered.length} projects`,
                    `Alle ${filtered.length} Projekte`,
                  )
                : t(
                    `Showing ${Math.min(6, filtered.length)} of ${filtered.length} projects`,
                    `Zeige ${Math.min(6, filtered.length)} von ${filtered.length} Projekten`,
                  )}
            </p>
          </div>
        )}
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────── */}
      <section id="about" className="block px">
        <p className="eyebrow">{t("(02) — ABOUT ME", "(02) — ÜBER MICH")}</p>
        <h2 className="section-title">
          {L(settings?.aboutTitle) || t("Hi, I'm Andrin.", "Hallo, ich bin Andrin.")}
        </h2>

        <div className="about-grid">
          <div className="about-photo">
            <div className="frame">
              <div className="ph-stack">
                <div className="ph-icon">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity=".5"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <p className="ph-text">
                  PHOTO
                  <br />
                  COMING SOON
                </p>
              </div>
            </div>
            <p className="about-bio">
              {L(settings?.aboutBio) ||
                t(
                  "Bachelor student in Interaction Design at ZHdK Zürich. I think in systems, prototype in code, and love building things that feel right.",
                  "Bachelorstudent für Interaction Design an der ZHdK Zürich. Ich denke in Systemen, prototype in Code und liebe es, Dinge zu bauen, die sich gut anfühlen.",
                )}
            </p>
          </div>

          <div>
            <div className="timeline-head">
              <p className="eyebrow">
                {L(settings?.journeyEyebrow) || t("TIMELINE", "ZEITSTRAHL")}
              </p>
              <p className="hint">
                {t(
                  "Click an entry for more details",
                  "Klick auf einen Eintrag für mehr Details",
                )}
              </p>
            </div>
            <h3 className="timeline-title">
              {L(settings?.journeyTitle) || t("My journey.", "Mein Werdegang.")}
            </h3>

            <ol className="timeline">
              {(settings?.journey ?? []).map((it, i) => (
                <li
                  className={`timeline-item${openTimeline === i ? " open" : ""}`}
                  key={i}
                >
                  <span className="timeline-dot" />
                  <button
                    className="timeline-btn"
                    onClick={() => setOpenTimeline(openTimeline === i ? -1 : i)}
                  >
                    <div className="timeline-btn-row">
                      <div>
                        <p className="timeline-year">{it.year}</p>
                        <p className="timeline-h">{L(it.title)}</p>
                        <p className="timeline-place">{L(it.place)}</p>
                      </div>
                      <svg
                        className="timeline-chev"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                    <div className="timeline-body">
                      <div>
                        <p>{L(it.body)}</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── TECH STACK ────────────────────────────────────────────────── */}
      {(stack.length > 0 || toolReceipts.length > 0) && (
        <section id="stack" className="block px">
          <div className="stack-head">
            <div>
              <p className="eyebrow">
                {t("(03) — TOOL RECEIPTS", "(03) — TOOL RECEIPTS")}
              </p>
              <h2>{t("Tools with traces.", "Tools im Einsatz.")}</h2>
            </div>
            <div className="rhs">
              <p>
                {t(
                  "The tools I reach for across interaction design, creative code and research.",
                  "Die Tools, zu denen ich in Interaction Design, Creative Code und Research greife.",
                )}
              </p>
              <div className="stack-view-switch" role="tablist" aria-label="Stack view">
                <button
                  className={`stack-view-btn${stackView === "receipts" ? " is-active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={stackView === "receipts"}
                  onClick={() => setStackView("receipts")}
                >
                  {t("Receipts", "Receipts")}
                </button>
                <button
                  className={`stack-view-btn${stackView === "cards" ? " is-active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={stackView === "cards"}
                  onClick={() => setStackView("cards")}
                >
                  {t("Tiles", "Kacheln")}
                </button>
              </div>
            </div>
          </div>

          {stackView === "receipts" && toolReceipts.length > 0 && (
            <div className="tool-receipts">
              {toolReceipts.map((receipt, i) => (
                <article
                  key={receipt._id}
                  className="tool-receipt-row"
                  style={{ ["--receipt-color" as string]: receipt.color || "var(--accent)" }}
                >
                  <div className="tool-receipt-index">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="tool-receipt-title">{L(receipt.label)}</h3>
                    <div className="tool-receipt-tools">
                      {(receipt.tools ?? []).map((tool) => (
                        <span key={tool} className="tool-chip">{tool}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="tool-receipt-evidence">{L(receipt.evidence)}</p>
                    <div className="tool-receipt-projects">
                      {(receipt.projects ?? []).map((p) => (
                        <Link
                          key={p.slug}
                          href={`/work/${p.slug}`}
                          className="tool-project"
                        >
                          {p.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {stackView === "cards" && stack.length > 0 && (
            <div className="stack-grid">
              {stack
                .slice()
                .sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
                .map((s) => (
                  <div
                    className="stack-card"
                    key={s._id}
                    data-id={s.key}
                    data-cat={s.category}
                    style={{ ["--tool-color" as string]: s.color || "#888" }}
                  >
                    {s.category && (
                      <span className="stack-cat">
                        {s.category.toUpperCase()}
                      </span>
                    )}
                    <div
                      className="stack-icon"
                      dangerouslySetInnerHTML={{ __html: s.icon || s.name[0] }}
                    />
                    <p className="stack-name">{s.name}</p>
                    {s.years != null && (
                      <p className="stack-meta">
                        {s.years}{" "}
                        {lang === "de"
                          ? s.years === 1
                            ? "Jahr"
                            : "Jahre"
                          : s.years === 1
                            ? "year"
                            : "years"}
                      </p>
                    )}
                    <div
                      className="stack-level"
                      aria-label={`Skill level ${s.level ?? 0} of 5`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={i < (s.level ?? 0) ? "on" : ""}
                        />
                      ))}
                    </div>
                    <p className="stack-desc">{L(s.description)}</p>
                  </div>
                ))}
            </div>
          )}
        </section>
      )}

      {/* ── CAPABILITIES ──────────────────────────────────────────────── */}
      <section className="block px">
        <p className="eyebrow">{t("(04) — WHAT I DO", "(04) — WAS ICH MACHE")}</p>
        <h2 className="section-title">
          {t("Three things, mostly.", "Drei Dinge, hauptsächlich.")}
        </h2>

        <div className="cap-grid">
          <div className="cap-card">
            <h3>{t("Interaction Design", "Interaction Design")}</h3>
            <p>
              {t(
                "From paper sketch to studio crit. UX flows, info architecture, prototyping in Figma and a healthy obsession with design tokens.",
                "Von der Skizze bis zur Studio-Crit. UX-Flows, Informationsarchitektur, Prototyping in Figma und eine gesunde Obsession für Design Tokens.",
              )}
            </p>
          </div>
          <div className="cap-card">
            <h3>{t("Creative Coding", "Creative Coding")}</h3>
            <p>
              {t(
                "p5.js, JavaScript, Arduino. Generative typography, real-time tracking, MediaPipe, sensors and a soft spot for janky hardware.",
                "p5.js, JavaScript, Arduino. Generative Typografie, Echtzeit-Tracking, MediaPipe, Sensoren und ein Faible für eigenwillige Hardware.",
              )}
            </p>
          </div>
          <div className="cap-card">
            <h3>{t("Concept & Research", "Konzept & Research")}</h3>
            <p>
              {t(
                "Design theory, sustainability, ethnography. Crawford, Latour, Dunne & Raby — and asking what design is actually for.",
                "Designtheorie, Nachhaltigkeit, Ethnografie. Crawford, Latour, Dunne & Raby — und die Frage, wofür Design eigentlich da ist.",
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ── NOW ───────────────────────────────────────────────────────── */}
      {settings?.now && settings.now.length > 0 && (
        <section className="block px">
          <div className="now-head">
            <div>
              <p className="eyebrow">{t("(05) — CURRENTLY", "(05) — AKTUELL")}</p>
              <h2
                style={{
                  margin: "16px 0 0",
                  fontWeight: 700,
                  fontSize: "clamp(32px,4vw,48px)",
                  letterSpacing: "-0.96px",
                  lineHeight: 1,
                }}
              >
                {t(
                  "On my desk right now.",
                  "Was gerade auf meinem Tisch liegt.",
                )}
              </h2>
            </div>
          </div>

          <div className="now-grid">
            {settings.now.map((card, i) => (
              <div className="now-card" key={i}>
                <p className="label">{L(card.label)}</p>
                <p className="text">{L(card.text)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CONTACT ───────────────────────────────────────────────────── */}
      <section id="contact" className="block px contact">
        <p className="eyebrow">{t("(06) — GET IN TOUCH", "(06) — KONTAKT")}</p>
        <h2 style={{ whiteSpace: "pre-line" }}>
          {L(settings?.contactTitle) ||
            t("Let's make\nsomething cool.", "Lass uns etwas Cooles machen.")}
        </h2>

        {settings?.email && (
          <a className="email-btn" href={`mailto:${settings.email}`}>
            {settings.email} <span className="arrow">↗</span>
          </a>
        )}

        {settings?.socials && settings.socials.length > 0 && (
          <div className="socials">
            {settings.socials.map((s, i) => (
              <span key={i}>
                <a href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
                {i < settings.socials!.length - 1 && (
                  <span className="dot">·</span>
                )}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="footer px">
        <div className="footer-inner">
          <p className="footer-made">
            {L(settings?.footerText) ||
              t(
                "© 2026 Andrin · Made in Zürich with too much coffee",
                "© 2026 Andrin · Made in Zürich mit zu viel Kaffee",
              )}
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
function cardTitle(p: ProjectListItem, lang: "en" | "de") {
  return p.cardTitle ? loc(p.cardTitle, lang) || p.title : p.title;
}

function thumbStyle(p: ProjectListItem): React.CSSProperties {
  const url = imgUrl(p.coverImage?.url, 800);
  return {
    backgroundColor: p.accent || "var(--accent)",
    ...(url ? { backgroundImage: `url('${url}')` } : {}),
  };
}

function SpiralCard({ p, title }: { p: ProjectListItem; title: string }) {
  return (
    <Link
      className="spiral-card"
      data-slug={p.slug}
      href={`/work/${p.slug}`}
      style={thumbStyle(p)}
      aria-label={title}
    >
      <span className="spiral-meta">
        <span className="spiral-title">{title}</span>
        <span className="spiral-year">{p.year}</span>
      </span>
    </Link>
  );
}

function ProjCard({
  p,
  title,
  tag,
  desc,
  more,
}: {
  p: ProjectListItem;
  title: string;
  tag: string;
  desc: string;
  more: string;
}) {
  const hasImage = !!p.coverImage?.url;
  return (
    <Link className="proj-card" data-slug={p.slug} href={`/work/${p.slug}`}>
      <div
        className={`proj-thumb${hasImage ? " has-image" : ""}`}
        style={thumbStyle(p)}
      >
        {tag && <span className="tag">{tag}</span>}
      </div>
      <div className="proj-info">
        <div className="row1">
          <h3>{title}</h3>
          <span className="year">{p.year}</span>
        </div>
        <p className="desc">{desc}</p>
        <span className="more">{more}</span>
      </div>
    </Link>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`work-filter-chip${active ? " is-active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/* ── Inline icons ─────────────────────────────────────────────────────── */
function SunIcon() {
  return (
    <svg
      className="icon-sun"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg
      className="icon-moon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
