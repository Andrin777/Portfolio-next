"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  basePath: "/studio",
  projectId: "dn3kpg18",
  dataset: "production",
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});

