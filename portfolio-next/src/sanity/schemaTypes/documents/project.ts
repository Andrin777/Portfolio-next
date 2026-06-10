import { CaseIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: CaseIcon,
  groups: [
    { name: "core", title: "Core", default: true },
    { name: "media", title: "Media" },
    { name: "details", title: "Details" },
  ],
  fields: [
    /* ── Core ────────────────────────────────────────────────────────── */
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "core",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleSub",
      title: "Subtitle (e.g. Japanese name)",
      type: "string",
      group: "core",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "core",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Sort order (lower = first)",
      type: "number",
      group: "core",
      description: 'Corresponds to the old "num" field.',
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      group: "core",
    }),
    defineField({
      name: "topic",
      title: "Topic",
      type: "reference",
      to: [{ type: "workTopic" }],
      group: "core",
    }),
    defineField({
      name: "accent",
      title: "Accent colour (hex)",
      type: "string",
      group: "core",
      description: "Used for highlights/hover states, e.g. #ff2d3d",
      validation: (r) =>
        r.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
          name: "hex colour",
        }).warning("Use a hex colour like #ff2d3d"),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      group: "core",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tag",
      title: "Tag (small label)",
      type: "localeString",
      group: "core",
    }),
    defineField({
      name: "cardTitle",
      title: "Play / card title",
      type: "localeString",
      group: "core",
      description: 'Shown on the work card ("playTitle" in the old data).',
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "localeText",
      group: "core",
    }),

    /* ── Details ─────────────────────────────────────────────────────── */
    defineField({
      name: "intro",
      title: "Intro (project page lead)",
      type: "localeText",
      group: "details",
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "highlight" })],
    }),
    defineField({
      name: "flipbookUrl",
      title: "Flipbook URL (FlipHTML5)",
      type: "url",
      group: "details",
      description: "Optional embedded flipbook at the bottom of the page.",
    }),

    /* ── Media ───────────────────────────────────────────────────────── */
    defineField({
      name: "mediaIntro",
      title: "Media section heading",
      type: "object",
      group: "media",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "localeString" }),
        defineField({ name: "heading", title: "Heading", type: "localeString" }),
        defineField({ name: "brief", title: "Brief", type: "localeText" }),
      ],
    }),
    defineField({
      name: "mediaBlocks",
      title: "Media blocks",
      type: "array",
      group: "media",
      description:
        "Build the project page body: galleries, videos and embeds in any order.",
      of: [
        defineArrayMember({ type: "mediaSector" }),
        defineArrayMember({ type: "mediaGallery" }),
        defineArrayMember({ type: "mediaVideo" }),
        defineArrayMember({ type: "mediaEmbed" }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Sort order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "year", media: "coverImage" },
  },
});
