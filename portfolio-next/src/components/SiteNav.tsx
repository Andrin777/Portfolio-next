"use client";

import Link from "next/link";

import { useLang } from "@/lib/locale";

const LABELS = {
  work: { en: "Work", de: "Arbeiten" },
  about: { en: "About", de: "Über mich" },
  contact: { en: "Contact", de: "Kontakt" },
};

export function SiteNav() {
  const { lang, toggle } = useLang();
  return (
    <nav className="nav px">
      <Link href="/" className="nav-brand">
        Andrin
      </Link>
      <div className="nav-links">
        <Link href="/#work">{LABELS.work[lang]}</Link>
        <Link href="/#about">{LABELS.about[lang]}</Link>
        <Link href="/#contact">{LABELS.contact[lang]}</Link>
        <button
          type="button"
          className="lang-toggle"
          onClick={toggle}
          aria-label="Toggle language"
        >
          {lang === "en" ? "DE" : "EN"}
        </button>
      </div>
    </nav>
  );
}
