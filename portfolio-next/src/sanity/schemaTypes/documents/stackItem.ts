import { ComponentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const stackItem = defineType({
  name: "stackItem",
  title: "Stack tool",
  type: "document",
  icon: ComponentIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "key",
      title: "Key / id",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Design", value: "design" },
          { title: "Code", value: "code" },
          { title: "3D & Tools", value: "3d" },
        ],
        layout: "radio",
      },
    }),
    defineField({ name: "icon", title: "Icon label (e.g. Fi, Ps)", type: "string" }),
    defineField({ name: "color", title: "Brand colour (hex)", type: "string" }),
    defineField({
      name: "years",
      title: "Years of experience",
      type: "number",
    }),
    defineField({
      name: "level",
      title: "Skill level (1–5)",
      type: "number",
      validation: (r) => r.min(1).max(5),
    }),
    defineField({ name: "description", title: "Description", type: "localeString" }),
    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
    }),
  ],
  orderings: [
    { title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", subtitle: "category" },
  },
});
