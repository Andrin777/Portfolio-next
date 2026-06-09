"use client";

import { imgUrl } from "@/lib/img";
import { loc, useLang } from "@/lib/locale";
import type { Lang, Locale, MediaBlock } from "@/lib/types";

function BlockHead({
  eyebrow,
  heading,
  lang,
}: {
  eyebrow?: Locale;
  heading?: Locale;
  lang: Lang;
}) {
  const eb = loc(eyebrow, lang);
  const hd = loc(heading, lang);
  if (!eb && !hd) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      {eb && <p className="eyebrow">{eb}</p>}
      {hd && (
        <h3 style={{ fontSize: "clamp(20px,3vw,30px)", margin: 0 }}>{hd}</h3>
      )}
    </div>
  );
}

export function MediaBlocks({ blocks }: { blocks?: MediaBlock[] }) {
  const { lang } = useLang();
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block) => {
        if (block._type === "mediaGallery") {
          return (
            <div className="media-block" key={block._key}>
              <BlockHead eyebrow={block.eyebrow} heading={block.heading} lang={lang} />
              {block.intro && (
                <p className="muted" style={{ maxWidth: "60ch", marginBottom: 18 }}>
                  {loc(block.intro, lang)}
                </p>
              )}
              <div className="media-gallery-grid">
                {block.images?.map((img, i) => {
                  const fit = img.fit || block.fit || "cover";
                  return (
                    <div className={`item ${fit}`} key={i}>
                      {img.image?.url && (
                        <img
                          src={imgUrl(img.image.url, 900)}
                          alt={loc(img.caption, lang) || ""}
                          loading="lazy"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        if (block._type === "mediaVideo") {
          return (
            <div className="media-block media-video" key={block._key}>
              <BlockHead eyebrow={block.eyebrow} heading={block.heading} lang={lang} />
              {block.videoUrl && (
                <video
                  src={block.videoUrl}
                  poster={imgUrl(block.poster?.url, 1200) || undefined}
                  controls={!block.loop}
                  autoPlay={block.loop}
                  muted={block.loop}
                  loop={block.loop}
                  playsInline
                />
              )}
            </div>
          );
        }

        if (block._type === "mediaEmbed") {
          return (
            <div className="media-block media-embed" key={block._key}>
              <BlockHead eyebrow={block.eyebrow} heading={block.heading} lang={lang} />
              {block.hint && (
                <p className="muted" style={{ maxWidth: "60ch", marginBottom: 14 }}>
                  {loc(block.hint, lang)}
                </p>
              )}
              {block.url && (
                <iframe
                  src={block.url}
                  loading="lazy"
                  style={{ aspectRatio: block.aspectRatio || "16/9" }}
                  allowFullScreen
                />
              )}
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
