import { DocumentIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const toolReceipt = defineType({
  name: "toolReceipt",
  title: "Tool receipt",
  type: "document",
  icon: DocumentIcon,
  description: "Groups tools by what they produced, linked to projects.",
  fields: [
    defineField({
      name: "key",
      title: "Key / id",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({ name: "color", title: "Accent colour (hex)", type: "string" }),
    defineField({
      name: "tools",
      title: "Tools",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({ name: "evidence", title: "Evidence text", type: "localeText" }),
    defineField({
      name: "projects",
      title: "Related projects",
      type: "array",
      of: [
        defineArrayMember({ type: "reference", to: [{ type: "project" }] }),
      ],
    }),
    defineField({ name: "order", title: "Sort order", type: "number" }),
  ],
  orderings: [
    { title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "label.en", subtitle: "key" },
  },
});
