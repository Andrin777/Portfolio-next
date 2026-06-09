import { defineField, defineType } from "sanity";

/**
 * Supported languages. The original portfolio is fully bilingual (EN / DE),
 * so every editorial field is stored as `{ en, de }`.
 */
export const supportedLanguages: {
  id: string;
  title: string;
  isDefault?: boolean;
}[] = [
  { id: "en", title: "English", isDefault: true },
  { id: "de", title: "Deutsch" },
];

export const baseLanguage = supportedLanguages.find((l) => l.isDefault);

/** Short, single-line localized value (titles, tags, labels). */
export const localeString = defineType({
  name: "localeString",
  title: "Localized string",
  type: "object",
  options: { collapsible: false },
  fields: supportedLanguages.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: "string",
    }),
  ),
});

/** Longer, multi-line localized value (intros, descriptions, briefs). */
export const localeText = defineType({
  name: "localeText",
  title: "Localized text",
  type: "object",
  options: { collapsible: false },
  fields: supportedLanguages.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: "text",
      rows: 4,
    }),
  ),
});
