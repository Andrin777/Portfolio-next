"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { imgUrl } from "@/lib/img";
import { loc, useLang } from "@/lib/locale";
import type {
  GalleryImage,
  Lang,
  Locale,
  MediaBlock,
  SectorMediaItem,
} from "@/lib/types";

/* ── Icons ─────────────────────────────────────────────────────────────── */

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

const ChevronLeft = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Block heading ─────────────────────────────────────────────────────── */

function BlockHead({
  eyebrow,
  heading,
  intro,
  lang,
}: {
  eyebrow?: Locale;
  heading?: Locale;
  intro?: Locale;
  lang: Lang;
}) {
  const eb = loc(eyebrow, lang);
  const hd = loc(heading, lang);
  const in_ = loc(intro, lang);
  if (!eb && !hd && !in_) return null;
  return (
    <div className="proj-media-sector-head" style={{ marginBottom: 18 }}>
      {eb && <p className="eyebrow">{eb}</p>}
      {hd && <h3>{hd}</h3>}
      {in_ && <p>{in_}</p>}
    </div>
  );
}

/* ── Lightbox ──────────────────────────────────────────────────────────── */

type LightboxContent =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster?: string };

function Lightbox({
  content,
  onClose,
  closeLabel,
  dialogLabel,
}: {
  content: LightboxContent;
  onClose: () => void;
  closeLabel: string;
  dialogLabel: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.classList.add("media-lightbox-open");
    // Remember what was focused so we can restore it when the dialog closes.
    const opener = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Keep Tab focus inside the dialog.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, video, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("media-lightbox-open");
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      className="media-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={dialogLabel}
      onClick={onClose}
    >
      <button
        ref={closeBtnRef}
        type="button"
        className="media-lightbox-close"
        aria-label={closeLabel}
        onClick={onClose}
      >
        <CloseIcon />
      </button>
      {content.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.src}
          alt={content.alt}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <video
          src={content.src}
          poster={content.poster}
          controls
          autoPlay
          playsInline
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}

/* ── Gallery carousel ──────────────────────────────────────────────────── */

function GalleryCarousel({
  images,
  defaultFit,
  lang,
  onOpenLightbox,
}: {
  images: GalleryImage[];
  defaultFit?: "cover" | "contain";
  lang: Lang;
  onOpenLightbox: (content: LightboxContent) => void;
}) {
  const [index, setIndex] = useState(0);
  const total = images.length;
  const t = (en: string, de: string) => (lang === "de" ? de : en);

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + total) % total),
    [total],
  );

  if (!total) return null;

  const current = images[index];
  const fit = current.fit || defaultFit || "cover";
  const src = imgUrl(current.image?.url, 1600);
  const alt =
    loc(current.alt, lang) ||
    loc(current.caption, lang) ||
    t("Project image", "Projektbild");

  return (
    <figure
      className={`proj-media-carousel-frame${fit === "contain" ? " is-contain" : ""}`}
      style={{ marginTop: 0 }}
      {...(total > 1
        ? {
            tabIndex: 0,
            role: "group",
            "aria-roledescription": t("carousel", "Karussell"),
            "aria-label": t(
              `Image gallery, ${total} images`,
              `Bildergalerie, ${total} Bilder`,
            ),
            onKeyDown: (e: ReactKeyboardEvent) => {
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                go(-1);
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                go(1);
              }
            },
          }
        : {})}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onClick={() => onOpenLightbox({ kind: "image", src, alt })}
          style={{ cursor: "zoom-in" }}
        />
      )}

      <button
        type="button"
        className="media-expand-btn"
        aria-label={t("Enlarge image", "Bild vergrößern")}
        onClick={() => src && onOpenLightbox({ kind: "image", src, alt })}
      >
        <ExpandIcon />
      </button>

      {total > 1 && (
        <>
          <span
            className="proj-media-carousel-count"
            aria-live="polite"
            aria-label={t(
              `Image ${index + 1} of ${total}`,
              `Bild ${index + 1} von ${total}`,
            )}
          >
            {index + 1} / {total}
          </span>
          <div className="proj-media-carousel-controls">
            <button
              type="button"
              className="proj-media-nav"
              aria-label={t("Previous image", "Vorheriges Bild")}
              onClick={() => go(-1)}
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              className="proj-media-nav"
              aria-label={t("Next image", "Nächstes Bild")}
              onClick={() => go(1)}
            >
              <ChevronRight />
            </button>
          </div>
        </>
      )}
    </figure>
  );
}

/* ── Video with expand ─────────────────────────────────────────────────── */

function VideoBlock({
  block,
  lang,
  onOpenLightbox,
}: {
  block: Extract<MediaBlock, { _type: "mediaVideo" }>;
  lang: Lang;
  onOpenLightbox: (content: LightboxContent) => void;
}) {
  const t = (en: string, de: string) => (lang === "de" ? de : en);
  const poster = imgUrl(block.poster?.url, 1400) || undefined;
  if (!block.videoUrl) return null;

  return (
    <figure className="proj-media-video" style={{ marginTop: 0 }}>
      <video
        src={block.videoUrl}
        poster={poster}
        controls={!block.loop}
        autoPlay={block.loop}
        muted={block.loop}
        loop={block.loop}
        playsInline
        preload={block.loop ? "auto" : "none"}
      />
      <button
        type="button"
        className="media-expand-btn"
        aria-label={t("Enlarge video", "Video vergrößern")}
        onClick={() =>
          onOpenLightbox({ kind: "video", src: block.videoUrl!, poster })
        }
      >
        <ExpandIcon />
      </button>
    </figure>
  );
}

/* ── Editorial sector (text left, media grid right) ────────────────────── */

function SectorBlock({
  block,
  lang,
  onOpenLightbox,
}: {
  block: Extract<MediaBlock, { _type: "mediaSector" }>;
  lang: Lang;
  onOpenLightbox: (content: LightboxContent) => void;
}) {
  const t = (en: string, de: string) => (lang === "de" ? de : en);
  const eyebrow = loc(block.eyebrow, lang);
  const heading = loc(block.heading, lang);
  const brief = loc(block.brief, lang);
  const media = (block.media ?? []).filter(
    (m): m is SectorMediaItem =>
      (m._type === "galleryImage" && !!m.image?.url) ||
      (m._type === "sectorVideo" && !!m.videoUrl),
  );

  if (!media.length && !eyebrow && !heading && !brief) return null;

  // Faithful to the legacy layout: the first item spans both columns unless
  // any item is explicitly flagged wide.
  const anyWide = media.some((m) => m.isWide);

  return (
    <section className="proj-media-sector">
      <div className="proj-media-sector-head">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {heading && <h3>{heading}</h3>}
        {brief && <p>{brief}</p>}
      </div>
      <div className="proj-media-sector-content">
        {media.length > 0 && (
          <div className="proj-media-sector-media">
            {media.map((item, i) => {
              const wide = item.isWide || (!anyWide && i === 0);
              const cls = wide ? " is-wide" : "";
              const caption = loc(item.caption, lang) || "";
              const mediaAlt =
                loc(item.alt, lang) ||
                caption ||
                t("Project image", "Projektbild");

              if (item._type === "sectorVideo") {
                const poster = imgUrl(item.poster?.url, 1400) || undefined;
                return (
                  <figure
                    key={item._key}
                    className={`proj-media-sector-video${cls}`}
                  >
                    <video
                      src={item.videoUrl}
                      poster={poster}
                      controls
                      muted
                      playsInline
                      preload="none"
                      title={caption || undefined}
                    />
                    <button
                      type="button"
                      className="media-expand-btn"
                      aria-label={t("Enlarge video", "Video vergrößern")}
                      onClick={() =>
                        onOpenLightbox({
                          kind: "video",
                          src: item.videoUrl!,
                          poster,
                        })
                      }
                    >
                      <ExpandIcon />
                    </button>
                  </figure>
                );
              }

              const src = imgUrl(item.image?.url, 1600);
              return (
                <figure
                  key={item._key}
                  className={`proj-media-sector-figure${cls}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={mediaAlt}
                    loading="lazy"
                    onClick={() =>
                      onOpenLightbox({ kind: "image", src, alt: mediaAlt })
                    }
                    style={{ cursor: "zoom-in" }}
                  />
                  <button
                    type="button"
                    className="media-expand-btn"
                    aria-label={t("Enlarge image", "Bild vergrößern")}
                    onClick={() =>
                      onOpenLightbox({ kind: "image", src, alt: caption })
                    }
                  >
                    <ExpandIcon />
                  </button>
                </figure>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Container ─────────────────────────────────────────────────────────── */

export function MediaBlocks({ blocks }: { blocks?: MediaBlock[] }) {
  const { lang } = useLang();
  const [lightbox, setLightbox] = useState<LightboxContent | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block) => {
        if (block._type === "mediaSector") {
          return (
            <SectorBlock
              key={block._key}
              block={block}
              lang={lang}
              onOpenLightbox={setLightbox}
            />
          );
        }

        if (block._type === "mediaGallery") {
          if (!block.images?.length) return null;
          return (
            <div key={block._key} style={{ marginTop: 32 }}>
              <BlockHead
                eyebrow={block.eyebrow}
                heading={block.heading}
                intro={block.intro}
                lang={lang}
              />
              <GalleryCarousel
                images={block.images}
                defaultFit={block.fit}
                lang={lang}
                onOpenLightbox={setLightbox}
              />
            </div>
          );
        }

        if (block._type === "mediaVideo") {
          return (
            <div key={block._key} style={{ marginTop: 32 }}>
              <BlockHead
                eyebrow={block.eyebrow}
                heading={block.heading}
                lang={lang}
              />
              <VideoBlock
                block={block}
                lang={lang}
                onOpenLightbox={setLightbox}
              />
            </div>
          );
        }

        if (block._type === "mediaEmbed") {
          const eb = loc(block.eyebrow, lang);
          const hd = loc(block.heading, lang);
          const hint = loc(block.hint, lang);
          return (
            <div className="proj-media-web" key={block._key}>
              {(eb || hd || hint) && (
                <div className="head">
                  <div>
                    {eb && <p className="eyebrow">{eb}</p>}
                    {hd && <h2>{hd}</h2>}
                  </div>
                  {hint && <p className="hint">{hint}</p>}
                </div>
              )}
              {block.url && (
                <div
                  className="proj-media-web-frame"
                  style={{ aspectRatio: block.aspectRatio || "16 / 10" }}
                >
                  <iframe
                    src={block.url}
                    loading="lazy"
                    allow="fullscreen"
                    title={hd || "Embedded media"}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                  />
                </div>
              )}
            </div>
          );
        }

        return null;
      })}

      {lightbox && (
        <Lightbox
          content={lightbox}
          onClose={closeLightbox}
          closeLabel={lang === "de" ? "Schließen" : "Close"}
          dialogLabel={lang === "de" ? "Medienansicht" : "Media viewer"}
        />
      )}
    </>
  );
}
