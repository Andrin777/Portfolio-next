"use client";

import { useCallback, useEffect, useState } from "react";

import { imgUrl } from "@/lib/img";
import { loc, useLang } from "@/lib/locale";
import type { GalleryImage, Lang, Locale, MediaBlock } from "@/lib/types";

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
}: {
  content: LightboxContent;
  onClose: () => void;
  closeLabel: string;
}) {
  useEffect(() => {
    document.body.classList.add("media-lightbox-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("media-lightbox-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="media-lightbox"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
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
  const alt = loc(current.caption, lang) || "";

  return (
    <figure
      className={`proj-media-carousel-frame${fit === "contain" ? " is-contain" : ""}`}
      style={{ marginTop: 0 }}
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
          <span className="proj-media-carousel-count">
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

/* ── Container ─────────────────────────────────────────────────────────── */

export function MediaBlocks({ blocks }: { blocks?: MediaBlock[] }) {
  const { lang } = useLang();
  const [lightbox, setLightbox] = useState<LightboxContent | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block) => {
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
        />
      )}
    </>
  );
}
