import { CogIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "general", title: "General", default: true },
    { name: "hero", title: "Hero" },
    { name: "about", title: "About" },
    { name: "contact", title: "Contact" },
  ],
  fields: [
    /* General */
    defineField({
      name: "siteTitle",
      title: "Site / page title",
      type: "string",
      group: "general",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 2,
      group: "general",
    }),
    defineField({
      name: "accentColor",
      title: "Default accent colour (hex)",
      type: "string",
      group: "general",
    }),
    defineField({ name: "email", title: "Contact email", type: "string", group: "general" }),

    /* Hero */
    defineField({ name: "status", title: "Status pill", type: "localeString", group: "hero" }),
    defineField({ name: "heroTitle", title: "Hero title", type: "localeText", group: "hero" }),
    defineField({ name: "heroLead", title: "Hero lead paragraph", type: "localeText", group: "hero" }),

    /* About */
    defineField({ name: "aboutTitle", title: "About title", type: "localeString", group: "about" }),
    defineField({ name: "aboutBio", title: "About bio", type: "localeText", group: "about" }),
    defineField({
      name: "journeyEyebrow",
      title: "Journey eyebrow",
      type: "localeString",
      group: "about",
    }),
    defineField({
      name: "journeyTitle",
      title: "Journey title",
      type: "localeString",
      group: "about",
    }),
    defineField({
      name: "journey",
      title: "Journey timeline",
      type: "array",
      group: "about",
      of: [defineArrayMember({ type: "journeyEntry" })],
    }),
    defineField({
      name: "now",
      title: "Currently (now cards)",
      type: "array",
      group: "about",
      of: [defineArrayMember({ type: "nowCard" })],
    }),

    /* Contact */
    defineField({
      name: "contactTitle",
      title: "Contact title",
      type: "localeText",
      group: "contact",
    }),
    defineField({
      name: "socials",
      title: "Social links",
      type: "array",
      group: "contact",
      of: [defineArrayMember({ type: "socialLink" })],
    }),
    defineField({
      name: "footerText",
      title: "Footer text",
      type: "localeString",
      group: "contact",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
