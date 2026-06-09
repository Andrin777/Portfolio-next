"use client";

import { imgUrl } from "@/lib/img";
import { loc, useLang } from "@/lib/locale";
import type { Lang, Locale, MediaBlock } from "@/lib/types";

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

export function MediaBlocks({ blocks }: { blocks?: MediaBlock[] }) {
  const { lang } = useLang();
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block) => {
        if (block._type === "mediaGallery") {
          return (
            <div key={block._key} style={{ marginTop: 32 }}>
              <BlockHead
                eyebrow={block.eyebrow}
                heading={block.heading}
                intro={block.intro}
                lang={lang}
              />
              <div className="proj-media-grid" style={{ marginTop: 0 }}>
                {block.images?.map((img, i) => {
                  const fit = img.fit || block.fit || "cover";
                  return (
                    <figure
                      className={`proj-media-figure${fit === "contain" ? " is-contain" : ""}`}
                      key={i}
                    >
                      {img.image?.url && (
                        <img
                          src={imgUrl(img.image.url, 1400)}
                          alt={loc(img.caption, lang) || ""}
                          loading="lazy"
                        />
                      )}
                    </figure>
                  );
                })}
              </div>
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
              {block.videoUrl && (
                <figure className="proj-media-video" style={{ marginTop: 0 }}>
                  <video
                    src={block.videoUrl}
                    poster={imgUrl(block.poster?.url, 1400) || undefined}
                    controls={!block.loop}
                    autoPlay={block.loop}
                    muted={block.loop}
                    loop={block.loop}
                    playsInline
                    preload={block.loop ? "auto" : "none"}
                  />
                </figure>
              )}
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
    </>
  );
}
