export const languages = {
  en: "English",
  de: "Deutsch",
  it: "Italiano",
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = "en";

export const locales = Object.keys(languages) as Lang[];

/**
 * Localized URL slugs per named route.
 * `home` maps to the locale root (`/` for en, `/de/` / `/it/` for others).
 * Add a new entry here whenever you add a translatable page.
 */
export const routeSlugs = {
  home: { en: "", de: "", it: "" },
  booking: {
    en: "book-tandem-flight",
    de: "tandemflug-buchen",
    it: "prenota-volo-tandem",
  },
} as const;

export type RouteKey = keyof typeof routeSlugs;
