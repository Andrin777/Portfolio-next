/**
 * One-time content import.
 *
 * Reads the legacy single-file portfolio (portfolio_V10.html) that sits one
 * directory up, extracts its PROJECTS / STACK / TOOL_RECEIPTS / CONFIG.content
 * data, uploads all referenced images & videos to Sanity and creates matching
 * documents.
 *
 * Usage:
 *   1. Fill in .env.local (project id, dataset, SANITY_API_WRITE_TOKEN)
 *   2. npm run import
 *
 * Safe to re-run: every document uses a deterministic _id, so a second run
 * replaces instead of duplicating.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { createClient } from "@sanity/client";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const legacyRoot = path.resolve(projectRoot, ".."); // the original portfolio folder
const sourceHtml = path.join(legacyRoot, "portfolio_V10.html");

dotenv.config({ path: path.join(projectRoot, ".env.local") });

const {
  NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
  NEXT_PUBLIC_SANITY_DATASET: dataset = "production",
  NEXT_PUBLIC_SANITY_API_VERSION: apiVersion = "2024-10-01",
  SANITY_API_WRITE_TOKEN: token,
} = process.env;

if (!projectId || !token) {
  console.error(
    "\n✗ Missing config. Set NEXT_PUBLIC_SANITY_PROJECT_ID and " +
      "SANITY_API_WRITE_TOKEN in portfolio-next/.env.local first.\n" +
      "  Create a write token at https://sanity.io/manage → API → Tokens (Editor).\n",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const html = fs.readFileSync(sourceHtml, "utf8");

/* ──────────────────────────── JS literal extraction ─────────────────── */

/** Slice a balanced {…} or […] starting at `start` (index of the opener). */
function sliceBalanced(src, start) {
  const open = src[start];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let str = null;
  let esc = false;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (str) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === str) str = null;
      continue;
    }
    if (ch === "/" && next === "/") {
      // line comment
      const nl = src.indexOf("\n", i);
      i = nl === -1 ? src.length : nl;
      continue;
    }
    if (ch === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? src.length : end + 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      str = ch;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error("Unbalanced literal starting at " + start);
}

function evalLiteral(literal) {
  // The literals are pure data (no external references), so this is safe.
  // eslint-disable-next-line no-new-func
  return new Function(`return (${literal});`)();
}

function extract(re, openerSearch) {
  const m = re.exec(html);
  if (!m) throw new Error("Could not find " + re);
  const openerIdx = html.indexOf(openerSearch, m.index);
  return evalLiteral(sliceBalanced(html, openerIdx));
}

const PROJECTS = extract(/const\s+PROJECTS\s*=\s*\[/, "[");
const STACK = extract(/const\s+STACK\s*=\s*\[/, "[");
const TOOL_RECEIPTS = extract(/const\s+TOOL_RECEIPTS\s*=\s*\[/, "[");
const content = extract(/content:\s*\{/, "{");
const workTopics = extract(/workTopics:\s*\[/, "[");

const email = /email:\s*"([^"]+)"/.exec(html)?.[1] || "";
const accentColor = /accentColor:\s*"([^"]+)"/.exec(html)?.[1] || "#ff2d3d";
const siteTitle = /<title>([^<]+)<\/title>/.exec(html)?.[1] || "Andrin";
const metaDescription =
  /name="description"\s+content="([^"]+)"/.exec(html)?.[1] || "";

/* ──────────────────────────── helpers ───────────────────────────────── */

const key = () => crypto.randomBytes(6).toString("hex");

function decode(s) {
  if (typeof s !== "string") return s;
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** Normalize a `{en, de}` value, decoding HTML entities. */
function loc(v) {
  if (!v) return undefined;
  if (typeof v === "string") return { _type: "localeString", en: decode(v) };
  return { _type: "localeString", en: decode(v.en), de: decode(v.de) };
}

/** Resolve a legacy relative asset path to an absolute file path (macOS NFC/NFD). */
function resolveAsset(rel) {
  for (const cand of [rel, rel.normalize("NFC"), rel.normalize("NFD")]) {
    const abs = path.join(legacyRoot, cand);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

const assetCache = new Map();

async function uploadAsset(kind, rel) {
  if (!rel) return null;
  const cacheKey = kind + ":" + rel;
  if (assetCache.has(cacheKey)) return assetCache.get(cacheKey);

  const abs = resolveAsset(rel);
  if (!abs) {
    console.warn("  ⚠ missing asset, skipped:", rel);
    return null;
  }
  const filename = path.basename(abs);
  process.stdout.write(`  ↑ ${kind}: ${rel} … `);
  const asset = await client.assets.upload(kind, fs.createReadStream(abs), {
    filename,
  });
  console.log("ok");
  assetCache.set(cacheKey, asset._id);
  return asset._id;
}

async function imageRef(rel) {
  const id = await uploadAsset("image", rel);
  if (!id) return undefined;
  return { _type: "image", asset: { _type: "reference", _ref: id } };
}

async function fileRef(rel) {
  const id = await uploadAsset("file", rel);
  if (!id) return undefined;
  return { _type: "file", asset: { _type: "reference", _ref: id } };
}

function normImg(entry) {
  if (typeof entry === "string") return { path: entry };
  return { path: entry.src, fit: entry.fit, pos: entry.pos };
}

async function galleryBlock(images, { eyebrow, heading, intro, fit } = {}) {
  if (!images?.length) return null;
  const items = [];
  for (const entry of images) {
    const n = normImg(entry);
    const image = await imageRef(n.path);
    if (!image) continue;
    items.push({ _type: "galleryImage", _key: key(), image, fit: n.fit || fit });
  }
  if (!items.length) return null;
  return {
    _type: "mediaGallery",
    _key: key(),
    eyebrow: loc(eyebrow),
    heading: loc(heading),
    intro: loc(intro),
    fit,
    images: items,
  };
}

async function videoBlock(src, { poster, eyebrow, heading, loop } = {}) {
  const video = await fileRef(src);
  if (!video) return null;
  return {
    _type: "mediaVideo",
    _key: key(),
    eyebrow: loc(eyebrow),
    heading: loc(heading),
    loop: !!loop,
    video,
    poster: poster ? await imageRef(poster) : undefined,
  };
}

/* Map the legacy `media` object → mediaIntro + mediaBlocks[] */
async function buildMedia(media) {
  if (!media) return { mediaIntro: undefined, mediaBlocks: [] };

  const mediaIntro = {
    eyebrow: loc(media.eyebrow),
    heading: loc(media.title),
    brief: loc(media.brief),
  };

  const blocks = [];
  const push = (b) => b && blocks.push(b);

  push(await galleryBlock(media.images, { fit: media.gridFit }));
  push(
    await galleryBlock(media.galleryImages, {
      eyebrow: media.galleryEyebrow,
      fit: media.galleryFit,
    }),
  );
  push(
    await galleryBlock(media.gallery2Images, {
      eyebrow: media.gallery2Eyebrow,
      fit: media.gallery2Fit,
    }),
  );
  if (media.loopVideo) push(await videoBlock(media.loopVideo, { loop: true }));
  push(
    await galleryBlock(media.gallery3Images, {
      eyebrow: media.gallery3Eyebrow,
      fit: media.gallery3Fit,
    }),
  );
  if (media.video)
    push(await videoBlock(media.video, { poster: media.videoPoster }));
  if (media.scrollVideo) push(await videoBlock(media.scrollVideo, { loop: true }));

  if (media.galleryVideos?.length) {
    for (let i = 0; i < media.galleryVideos.length; i++) {
      const v = media.galleryVideos[i];
      push(
        await videoBlock(v.src, {
          poster: v.poster,
          heading: v.title,
          eyebrow: i === 0 ? media.galleryEyebrow : undefined,
        }),
      );
    }
  }

  // 2D-zu-3D sectors
  if (media.sectors?.length) {
    for (const sector of media.sectors) {
      push(
        await galleryBlock(sector.colorImages, {
          eyebrow: sector.eyebrow,
          heading: sector.title,
          intro: sector.brief,
        }),
      );
      if (sector.turntable)
        push(
          await videoBlock(sector.turntable.src, {
            poster: sector.turntable.poster,
            loop: true,
          }),
        );
      push(
        await galleryBlock(sector.contextImages, {
          eyebrow: sector.contextEyebrow || { en: "In context", de: "Im Kontext" },
        }),
      );
    }
  }

  // Embedded web prototype (local html file → uploaded as a file asset)
  if (media.webUrl) {
    const abs = resolveAsset(media.webUrl);
    if (abs) {
      process.stdout.write(`  ↑ file: ${media.webUrl} … `);
      const asset = await client.assets.upload("file", fs.createReadStream(abs), {
        filename: path.basename(abs),
      });
      console.log("ok");
      blocks.push({
        _type: "mediaEmbed",
        _key: key(),
        eyebrow: loc(media.webEyebrow),
        heading: loc(media.webTitle),
        hint: loc(media.webHint),
        url: asset.url,
        aspectRatio: "4/3",
      });
    }
  }

  return { mediaIntro, mediaBlocks: blocks };
}

/* ──────────────────────────── document builders ─────────────────────── */

const topicById = new Map(workTopics.map((t) => [t.id, t]));

async function run() {
  const docs = [];

  // Work topics
  for (const t of workTopics) {
    docs.push({
      _id: `topic-${t.id}`,
      _type: "workTopic",
      key: { _type: "slug", current: t.id },
      label: loc(t.label),
    });
  }

  // Projects
  for (const p of PROJECTS) {
    console.log(`\n• Project: ${p.title}`);
    const { mediaIntro, mediaBlocks } = await buildMedia(p.media);
    docs.push({
      _id: `project-${p.slug}`,
      _type: "project",
      title: p.title,
      titleSub: p.titleSub,
      slug: { _type: "slug", current: p.slug },
      order: Number(p.num) || undefined,
      year: p.year,
      accent: p.accent,
      topic: topicById.has(p.topic)
        ? { _type: "reference", _ref: `topic-${p.topic}` }
        : undefined,
      coverImage: await imageRef(p.image),
      tag: loc(p.tag),
      cardTitle: loc(p.cardTitle || p.playTitle),
      description: loc(p.desc),
      intro: loc(p.intro),
      flipbookUrl: p.flipbook || undefined,
      mediaIntro,
      highlights: (p.highlights || []).map((h) => ({
        _type: "highlight",
        _key: key(),
        title: loc(h.t),
        body: loc(h.b),
      })),
      mediaBlocks,
    });
  }

  // Stack tools
  STACK.forEach((s, i) => {
    docs.push({
      _id: `stack-${s.id}`,
      _type: "stackItem",
      name: s.name,
      key: s.id,
      category: s.cat,
      icon: s.icon,
      color: s.color,
      years: s.years,
      level: s.level,
      description: loc(s.desc),
      order: i,
    });
  });

  // Tool receipts
  TOOL_RECEIPTS.forEach((r, i) => {
    docs.push({
      _id: `receipt-${r.id}`,
      _type: "toolReceipt",
      key: r.id,
      label: loc(r.label),
      color: r.color,
      tools: r.tools || [],
      evidence: loc(r.evidence),
      projects: (r.projects || []).map((slug) => ({
        _type: "reference",
        _key: key(),
        _ref: `project-${slug}`,
      })),
      order: i,
    });
  });

  // Site settings (singleton)
  docs.push({
    _id: "siteSettings",
    _type: "siteSettings",
    siteTitle,
    metaDescription,
    accentColor,
    email,
    status: loc(content.status),
    heroTitle: loc(content.heroTitle),
    heroLead: loc(content.heroLead),
    aboutTitle: loc(content.aboutTitle),
    aboutBio: loc(content.aboutBio),
    journeyEyebrow: loc(content.journeyMeta?.eyebrow),
    journeyTitle: loc(content.journeyMeta?.title),
    journey: (content.journey || []).map((j) => ({
      _type: "journeyEntry",
      _key: key(),
      year: j.y,
      title: loc(j.t),
      place: loc(j.p),
      body: loc(j.b),
    })),
    now: (content.now || []).map((n) => ({
      _type: "nowCard",
      _key: key(),
      label: loc(n.label),
      text: loc(n.text),
    })),
    contactTitle: loc(content.contactTitle),
    socials: (content.socials || []).map((s) => ({
      _type: "socialLink",
      _key: key(),
      label: s.label,
      href: s.href,
    })),
    footerText: loc(content.footerMade),
  });

  // Write everything in one transaction.
  console.log(`\nWriting ${docs.length} documents …`);
  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit();

  console.log(`\n✓ Imported ${PROJECTS.length} projects, ${STACK.length} tools, ` +
    `${TOOL_RECEIPTS.length} receipts and site settings.`);
  console.log("  Open the Studio at /studio to review.\n");
}

run().catch((err) => {
  console.error("\n✗ Import failed:\n", err);
  process.exit(1);
});
