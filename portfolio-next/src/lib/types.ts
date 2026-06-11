export type Lang = "en" | "de";

export type Locale = { en?: string | null; de?: string | null } | null | undefined;

export type SanityImage = {
  url?: string;
  dimensions?: { width: number; height: number; aspectRatio: number };
} | null;

export type GalleryImage = {
  fit?: "cover" | "contain";
  isWide?: boolean;
  caption?: Locale;
  alt?: Locale;
  image?: SanityImage;
};

export type SectorMediaItem =
  | {
      _type: "galleryImage";
      _key: string;
      isWide?: boolean;
      fit?: "cover" | "contain";
      caption?: Locale;
      alt?: Locale;
      image?: SanityImage;
    }
  | {
      _type: "sectorVideo";
      _key: string;
      isWide?: boolean;
      caption?: Locale;
      alt?: Locale;
      videoUrl?: string;
      poster?: SanityImage;
    };

export type MediaBlock =
  | {
      _type: "mediaSector";
      _key: string;
      eyebrow?: Locale;
      heading?: Locale;
      brief?: Locale;
      details?: Locale[];
      media?: SectorMediaItem[];
    }
  | {
      _type: "mediaGallery";
      _key: string;
      eyebrow?: Locale;
      heading?: Locale;
      intro?: Locale;
      fit?: "cover" | "contain";
      images?: GalleryImage[];
    }
  | {
      _type: "mediaVideo";
      _key: string;
      eyebrow?: Locale;
      heading?: Locale;
      loop?: boolean;
      videoUrl?: string;
      poster?: SanityImage;
    }
  | {
      _type: "mediaEmbed";
      _key: string;
      eyebrow?: Locale;
      heading?: Locale;
      hint?: Locale;
      url?: string;
      aspectRatio?: string;
    };

export type ProjectListItem = {
  _id: string;
  title: string;
  titleSub?: string;
  slug: string;
  order?: number;
  year?: string;
  accent?: string;
  topic?: { key?: string; label?: Locale } | null;
  tag?: Locale;
  cardTitle?: Locale;
  description?: Locale;
  coverImage?: SanityImage;
};

export type ProjectDetail = ProjectListItem & {
  intro?: Locale;
  flipbookUrl?: string;
  mediaIntro?: { eyebrow?: Locale; heading?: Locale; brief?: Locale };
  highlights?: { title?: Locale; body?: Locale }[];
  mediaBlocks?: MediaBlock[];
};

export type JourneyEntry = {
  year?: string;
  title?: Locale;
  place?: Locale;
  body?: Locale;
};

export type NowCard = { label?: Locale; text?: Locale };

export type SiteSettings = {
  siteTitle?: string;
  metaDescription?: string;
  accentColor?: string;
  email?: string;
  status?: Locale;
  heroTitle?: Locale;
  heroLead?: Locale;
  aboutTitle?: Locale;
  aboutBio?: Locale;
  journeyEyebrow?: Locale;
  journeyTitle?: Locale;
  journey?: JourneyEntry[];
  now?: NowCard[];
  contactTitle?: Locale;
  socials?: { label?: string; href?: string }[];
  footerText?: Locale;
} | null;

export type StackItem = {
  _id: string;
  name: string;
  key: string;
  category?: string;
  icon?: string;
  color?: string;
  years?: number;
  level?: number;
  description?: Locale;
};

export type ToolReceipt = {
  _id: string;
  key: string;
  color?: string;
  label?: Locale;
  tools?: string[];
  evidence?: Locale;
  projects?: { slug: string; title: string }[];
};
