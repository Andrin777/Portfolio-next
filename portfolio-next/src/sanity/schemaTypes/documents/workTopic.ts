import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const workTopic = defineType({
  name: "workTopic",
  title: "Work topic",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "key",
      title: "Key (slug used for filtering)",
      type: "slug",
      options: { source: "label.en" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "localeString",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "label.en", subtitle: "key.current" },
  },
});
