"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Lang, Locale } from "./types";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({
  children,
  defaultLang = "en",
}: {
  children: ReactNode;
  defaultLang?: Lang;
}) {
  const [lang, setLang] = useState<Lang>(defaultLang);

  // Restore the visitor's choice on mount (new key, fall back to legacy key).
  useEffect(() => {
    const stored = (window.localStorage.getItem("lang") ||
      window.localStorage.getItem("aa-lang")) as Lang | null;
    if (stored === "en" || stored === "de") setLang(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lang", lang);
    // Persist under the legacy key too, matching the old portfolio.
    window.localStorage.setItem("aa-lang", lang);
    document.documentElement.lang = lang;
    // Mirror onto a data attribute so the old CSS span-toggle mechanism
    // ([data-lang="en"] [data-de] { display:none }) keeps working.
    document.documentElement.dataset.lang = lang;
    document.body.dataset.lang = lang;
  }, [lang]);

  return (
    <LangContext.Provider
      value={{ lang, setLang, toggle: () => setLang(lang === "en" ? "de" : "en") }}
    >
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
}

/** Resolve a localized `{ en, de }` value for the active language. */
export function loc(value: Locale, lang: Lang): string {
  if (!value) return "";
  return value[lang] ?? value.en ?? value.de ?? "";
}
