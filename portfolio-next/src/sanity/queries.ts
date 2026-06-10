import { groq } from "next-sanity";

/* Reusable GROQ fragments */
const localeFields = `{ en, de }`;

const imageFields = `{
  ...,
  "url": asset->url,
  "dimensions": asset->metadata.dimensions
}`;

const galleryImageFields = `{
  fit,
  isWide,
  caption ${localeFields},
  alt ${localeFields},
  "image": image ${imageFields}
}`;

const sectorMediaFields = `{
  _type, _key, isWide,
  _type == "galleryImage" => {
    fit,
    caption ${localeFields},
    alt ${localeFields},
    "image": image ${imageFields}
  },
  _type == "sectorVideo" => {
    caption ${localeFields},
    alt ${localeFields},
    "videoUrl": video.asset->url,
    "poster": poster ${imageFields}
  }
}`;

const mediaBlockFields = `
  _type == "mediaSector" => {
    _type, _key,
    eyebrow ${localeFields},
    heading ${localeFields},
    brief ${localeFields},
    media[] ${sectorMediaFields}
  },
  _type == "mediaGallery" => {
    _type, _key,
    eyebrow ${localeFields},
    heading ${localeFields},
    intro ${localeFields},
    fit,
    images[] ${galleryImageFields}
  },
  _type == "mediaVideo" => {
    _type, _key,
    eyebrow ${localeFields},
    heading ${localeFields},
    loop,
    "videoUrl": video.asset->url,
    "poster": poster ${imageFields}
  },
  _type == "mediaEmbed" => {
    _type, _key,
    eyebrow ${localeFields},
    heading ${localeFields},
    hint ${localeFields},
    url,
    aspectRatio
  }
`;

/* ───────────────────────────── Site settings ────────────────────────── */
export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  siteTitle,
  metaDescription,
  accentColor,
  email,
  status ${localeFields},
  heroTitle ${localeFields},
  heroLead ${localeFields},
  aboutTitle ${localeFields},
  aboutBio ${localeFields},
  journeyEyebrow ${localeFields},
  journeyTitle ${localeFields},
  journey[]{ year, title ${localeFields}, place ${localeFields}, body ${localeFields} },
  now[]{ label ${localeFields}, text ${localeFields} },
  contactTitle ${localeFields},
  socials[]{ label, href },
  footerText ${localeFields}
}`;

/* ────────────────────────────── Projects ────────────────────────────── */
export const projectsListQuery = groq`*[_type == "project"] | order(order asc){
  _id,
  title,
  titleSub,
  "slug": slug.current,
  order,
  year,
  accent,
  "topic": topic->{ "key": key.current, label ${localeFields} },
  tag ${localeFields},
  cardTitle ${localeFields},
  description ${localeFields},
  "coverImage": coverImage ${imageFields}
}`;

export const projectSlugsQuery = groq`*[_type == "project" && defined(slug.current)][].slug.current`;

export const projectBySlugQuery = groq`*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  titleSub,
  "slug": slug.current,
  year,
  accent,
  "topic": topic->{ "key": key.current, label ${localeFields} },
  tag ${localeFields},
  cardTitle ${localeFields},
  description ${localeFields},
  intro ${localeFields},
  flipbookUrl,
  "coverImage": coverImage ${imageFields},
  mediaIntro{ eyebrow ${localeFields}, heading ${localeFields}, brief ${localeFields} },
  highlights[]{ title ${localeFields}, body ${localeFields} },
  mediaBlocks[]{ ${mediaBlockFields} }
}`;

/* ──────────────────────────── Stack / topics ────────────────────────── */
export const stackQuery = groq`*[_type == "stackItem"] | order(order asc){
  _id, name, key, category, icon, color, years, level,
  description ${localeFields}
}`;

export const toolReceiptsQuery = groq`*[_type == "toolReceipt"] | order(order asc){
  _id, key, color,
  label ${localeFields},
  tools,
  evidence ${localeFields},
  "projects": projects[]->{ "slug": slug.current, title }
}`;

export const workTopicsQuery = groq`*[_type == "workTopic"]{ "key": key.current, label ${localeFields} }`;
