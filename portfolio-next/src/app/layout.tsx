import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { LanguageProvider } from "@/lib/locale";
import { sanityFetch } from "@/sanity/fetch";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/lib/types";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch<SiteSettings>(siteSettingsQuery, null);
  return {
    title: settings?.siteTitle || "Andrin — Interaction Designer",
    description:
      settings?.metaDescription ||
      "Interaction Designer based in Zürich. Thoughtful, playful systems for humans, machines & everything in between.",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" data-lang="en" suppressHydrationWarning>
      <body className={inter.className} data-theme="dark" data-lang="en" suppressHydrationWarning>
        <LanguageProvider defaultLang="en">{children}</LanguageProvider>
      </body>
    </html>
  );
}
