"use client";

import { Fragment, useCallback, useEffect, useRef } from "react";

import { loc, useLang } from "@/lib/locale";
import type { Lang, MediaBlock, SectorMediaItem } from "@/lib/types";

/* ── Expand icon ───────────────────────────────────────────────────────── */

const ExpandIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

/* ── Video panel ───────────────────────────────────────────────────────── */

function VideoPanel({
  item,
  landscape,
  lang,
}: {
  item: Extract<SectorMediaItem, { _type: "sectorVideo" }>;
  landscape: boolean;
  lang: Lang;
}) {
  const t = (en: string, de: string) => (lang === "de" ? de : en);
  const panelRef = useRef<HTMLElement>(null);

  // Prefer the native Fullscreen API; fall back to a fixed-overlay class for
  // browsers (notably iOS Safari on non-video elements) that reject it.
  const expand = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        el.classList.add("is-expanded");
        document.body.classList.add("reactive-video-expanded");
      });
    } else {
      el.classList.add("is-expanded");
      document.body.classList.add("reactive-video-expanded");
    }
  }, []);

  // Allow clicking an overlay-expanded panel (the fallback path) to close it.
  const onPanelClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = panelRef.current;
    if (el?.classList.contains("is-expanded") && e.target === el) {
      el.classList.remove("is-expanded");
      document.body.classList.remove("reactive-video-expanded");
    }
  }, []);

  const caption =
    loc(item.alt, lang) || loc(item.caption, lang) || t("Project video", "Projektvideo");

  return (
    <figure
      ref={panelRef}
      className={`reactive-video-panel${landscape ? " is-landscape" : " is-portrait"}`}
      onClick={onPanelClick}
    >
      <video
        className="reactive-video-loop"
        src={item.videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={caption}
      />
      <button
        type="button"
        className="reactive-expand-btn"
        aria-label={t("Enlarge video", "Video vergrössern")}
        onClick={expand}
      >
        <ExpandIcon />
      </button>
    </figure>
  );
}

/* ── Container ─────────────────────────────────────────────────────────── */

/**
 * Bespoke editorial layout for the Reactive Signs project. Driven by the
 * project's `mediaSector` blocks: a sector whose video is flagged full width
 * renders as an intro brief above a wide video; any other sector renders as a
 * detail block with its text and a compact video panel side by side.
 */
export function ReactiveMedia({ blocks }: { blocks?: MediaBlock[] }) {
  const { lang } = useLang();

  // Restore scroll-lock cleanup if a fullscreen exit happens out of band.
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        document.body.classList.remove("reactive-video-expanded");
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const sectors = (blocks ?? []).filter(
    (b): b is Extract<MediaBlock, { _type: "mediaSector" }> =>
      b._type === "mediaSector",
  );
  if (!sectors.length) return null;

  return (
    <section className="proj-reactive px" id="projReactiveSection">
      <div className="reactive-video-stack">
        {sectors.map((sector) => {
          const eyebrow = loc(sector.eyebrow, lang);
          const brief = loc(sector.brief, lang);
          const details = (sector.details ?? [])
            .map((d) => loc(d, lang))
            .filter(Boolean);
          const video = (sector.media ?? []).find(
            (m): m is Extract<SectorMediaItem, { _type: "sectorVideo" }> =>
              m._type === "sectorVideo" && !!m.videoUrl,
          );
          const wide = video?.isWide ?? false;

          if (wide) {
            return (
              <Fragment key={sector._key}>
                <div className="reactive-brief">
                  {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                  {brief && <p>{brief}</p>}
                </div>
                {video && (
                  <VideoPanel item={video} landscape lang={lang} />
                )}
              </Fragment>
            );
          }

          return (
            <div className="reactive-detail-layout" key={sector._key}>
              <div className="reactive-detail">
                {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                {brief && <p>{brief}</p>}
                {details.length > 0 && (
                  <div className="reactive-detail-grid">
                    {details.map((d, i) => (
                      <p key={i}>{d}</p>
                    ))}
                  </div>
                )}
              </div>
              {video && (
                <VideoPanel item={video} landscape={false} lang={lang} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
