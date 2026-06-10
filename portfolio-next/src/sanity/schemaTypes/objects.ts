import { defineArrayMember, defineField, defineType } from "sanity";

/* ───────────────────────── Project highlights ───────────────────────── */

export const highlight = defineType({
  name: "highlight",
  title: "Highlight",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString" }),
    defineField({ name: "body", title: "Body", type: "localeText" }),
  ],
  preview: {
    select: { title: "title.en", subtitle: "body.en" },
  },
});

/* ───────────────────────── Gallery image item ───────────────────────── */
/** A single image inside a gallery, with an optional object-fit override. */
export const galleryImage = defineType({
  name: "galleryImage",
  title: "Image",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "fit",
      title: "Fit",
      type: "string",
      options: {
        list: [
          { title: "Cover (fill, may crop)", value: "cover" },
          { title: "Contain (show whole image)", value: "contain" },
        ],
        layout: "radio",
      },
      initialValue: "cover",
    }),
    defineField({ name: "caption", title: "Caption", type: "localeString" }),
    defineField({
      name: "isWide",
      title: "Full width in sector grid",
      type: "boolean",
      description:
        "When used inside a Media sector, span both columns. (Ignored in a plain gallery.) Leave off to let the first item span automatically.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { media: "image", subtitle: "fit" },
    prepare: ({ media, subtitle }) => ({ title: "Image", subtitle, media }),
  },
});

/* ───────────────────────── Sector video item ────────────────────────── */
/** A single video shown inside a Media sector's media grid. */
export const sectorVideo = defineType({
  name: "sectorVideo",
  title: "Video",
  type: "object",
  fields: [
    defineField({
      name: "video",
      title: "Video file",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "poster",
      title: "Poster image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "caption", title: "Caption", type: "localeString" }),
    defineField({
      name: "isWide",
      title: "Full width in sector grid",
      type: "boolean",
      description: "Span both columns of the sector grid.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { media: "poster", subtitle: "caption.en" },
    prepare: ({ media, subtitle }) => ({ title: "Video", subtitle, media }),
  },
});

/* ─────────────────────────── Media blocks ───────────────────────────── */
/** Image gallery / grid. */
export const mediaGallery = defineType({
  name: "mediaGallery",
  title: "Image gallery",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow (small label)", type: "localeString" }),
    defineField({ name: "heading", title: "Heading", type: "localeString" }),
    defineField({ name: "intro", title: "Intro text", type: "localeText" }),
    defineField({
      name: "fit",
      title: "Default fit",
      type: "string",
      options: {
        list: [
          { title: "Cover", value: "cover" },
          { title: "Contain", value: "contain" },
        ],
        layout: "radio",
      },
      initialValue: "cover",
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [defineArrayMember({ type: "galleryImage" })],
      options: { layout: "grid" },
    }),
  ],
  preview: {
    select: { title: "eyebrow.en", images: "images" },
    prepare: ({ title, images }) => ({
      title: title || "Image gallery",
      subtitle: `${images?.length || 0} image(s)`,
      media: images?.[0]?.image,
    }),
  },
});

/** Single video block. */
export const mediaVideo = defineType({
  name: "mediaVideo",
  title: "Video",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "localeString" }),
    defineField({ name: "heading", title: "Heading", type: "localeString" }),
    defineField({
      name: "video",
      title: "Video file",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "poster",
      title: "Poster image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "loop",
      title: "Loop / muted autoplay",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "heading.en", media: "poster" },
    prepare: ({ title, media }) => ({ title: title || "Video", media }),
  },
});

/** Embedded external page (FlipHTML5 flipbook, web prototype, etc.). */
export const mediaEmbed = defineType({
  name: "mediaEmbed",
  title: "Embed (iframe)",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "localeString" }),
    defineField({ name: "heading", title: "Heading", type: "localeString" }),
    defineField({ name: "hint", title: "Hint", type: "localeText" }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "aspectRatio",
      title: "Aspect ratio",
      type: "string",
      options: {
        list: [
          { title: "16 / 9", value: "16/9" },
          { title: "4 / 3", value: "4/3" },
          { title: "1 / 1", value: "1/1" },
          { title: "3 / 4 (portrait)", value: "3/4" },
        ],
      },
      initialValue: "16/9",
    }),
  ],
  preview: {
    select: { title: "heading.en", subtitle: "url" },
    prepare: ({ title, subtitle }) => ({ title: title || "Embed", subtitle }),
  },
});

/** Editorial sector: a text head (left column) beside a media grid (right). */
export const mediaSector = defineType({
  name: "mediaSector",
  title: "Media sector",
  type: "object",
  description:
    "Two-column block: eyebrow + title + brief on the left, a grid of images/videos on the right.",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow (small label)", type: "localeString" }),
    defineField({ name: "heading", title: "Title", type: "localeString" }),
    defineField({ name: "brief", title: "Brief", type: "localeText" }),
    defineField({
      name: "media",
      title: "Media (images & videos)",
      type: "array",
      description:
        "Shown as a grid. The first item spans full width unless you mark others as full width.",
      of: [
        defineArrayMember({ type: "galleryImage" }),
        defineArrayMember({ type: "sectorVideo" }),
      ],
      options: { layout: "grid" },
    }),
  ],
  preview: {
    select: { title: "heading.en", eyebrow: "eyebrow.en", media: "media" },
    prepare: ({ title, eyebrow, media }) => ({
      title: title || eyebrow || "Media sector",
      subtitle: `${media?.length || 0} item(s)`,
      media: media?.[0]?.image || media?.[0]?.poster,
    }),
  },
});

/* ─────────────────────── Site-settings sub-objects ──────────────────── */

export const journeyEntry = defineType({
  name: "journeyEntry",
  title: "Journey entry",
  type: "object",
  fields: [
    defineField({ name: "year", title: "Year", type: "string" }),
    defineField({ name: "title", title: "Title", type: "localeString" }),
    defineField({ name: "place", title: "Place / role", type: "localeString" }),
    defineField({ name: "body", title: "Body", type: "localeText" }),
  ],
  preview: {
    select: { title: "title.en", subtitle: "year" },
  },
});

export const nowCard = defineType({
  name: "nowCard",
  title: "Now card",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "localeString" }),
    defineField({ name: "text", title: "Text", type: "localeString" }),
  ],
  preview: {
    select: { title: "label.en", subtitle: "text.en" },
  },
});

export const socialLink = defineType({
  name: "socialLink",
  title: "Social link",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string" }),
    defineField({ name: "href", title: "URL", type: "url" }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
