import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "dn3kpg18",
  dataset: "production",
  apiVersion: "2026-05-15",
  useCdn: false,
});
