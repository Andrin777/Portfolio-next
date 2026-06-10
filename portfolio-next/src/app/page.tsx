import { HomeView } from "@/components/HomeView";
import { sanityFetch } from "@/sanity/fetch";
import {
  projectsListQuery,
  siteSettingsQuery,
  stackQuery,
  toolReceiptsQuery,
} from "@/sanity/queries";
import type { ProjectListItem, SiteSettings, StackItem, ToolReceipt } from "@/lib/types";

// Revalidate the home page every 60s (ISR) so CMS edits show up.
export const revalidate = 60;

export default async function HomePage() {
  const [settings, projects, stack, toolReceipts] = await Promise.all([
    sanityFetch<SiteSettings>(siteSettingsQuery, null),
    sanityFetch<ProjectListItem[]>(projectsListQuery, []),
    sanityFetch<StackItem[]>(stackQuery, []),
    sanityFetch<ToolReceipt[]>(toolReceiptsQuery, []),
  ]);

  return <HomeView settings={settings} projects={projects} stack={stack} toolReceipts={toolReceipts} />;
}
