import type { SchemaTypeDefinition } from "sanity";

import { localeString, localeText } from "./locale";
import {
  galleryImage,
  highlight,
  journeyEntry,
  mediaEmbed,
  mediaGallery,
  mediaVideo,
  nowCard,
  socialLink,
} from "./objects";
import { postType } from "./documents/post";
import { project } from "./documents/project";
import { siteSettings } from "./documents/siteSettings";
import { stackItem } from "./documents/stackItem";
import { toolReceipt } from "./documents/toolReceipt";
import { workTopic } from "./documents/workTopic";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Localization helpers
  localeString,
  localeText,
  // Reusable objects
  highlight,
  galleryImage,
  mediaGallery,
  mediaVideo,
  mediaEmbed,
  journeyEntry,
  nowCard,
  socialLink,
  // Documents
  postType,
  project,
  workTopic,
  stackItem,
  toolReceipt,
  siteSettings,
];
