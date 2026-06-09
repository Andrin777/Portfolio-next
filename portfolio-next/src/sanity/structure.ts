import type { StructureResolver } from "sanity/structure";

/**
 * Custom desk structure: pin "Site settings" as a single editable document
 * (singleton) and list the content types underneath it.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Portfolio")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.divider(),
      S.documentTypeListItem("post").title("Posts"),
      S.documentTypeListItem("project").title("Projects"),
      S.documentTypeListItem("workTopic").title("Work topics"),
      S.documentTypeListItem("stackItem").title("Stack tools"),
      S.documentTypeListItem("toolReceipt").title("Tool receipts"),
    ]);
