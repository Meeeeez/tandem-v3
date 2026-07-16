import {
  defaultLang,
  locales,
  routeSlugs,
  type Lang,
  type RouteKey,
} from "./config";
import { content } from "./content.ts";

/** Base path without a trailing slash, e.g. "/tandem-v3" (or "" in dev root). */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Detect the active locale from a request URL, falling back to the default. */
export function getLangFromUrl(url: URL): Lang {
  let path = url.pathname;
  if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length);
  const segment = path.split("/").filter(Boolean)[0];
  if (segment && (locales as string[]).includes(segment)) {
    return segment as Lang;
  }
  return defaultLang;
}

/** Return the translation dictionary for a given locale. */
export function useTranslations(lang: Lang) {
  return content[lang] ?? content[defaultLang];
}

/** Build a base-aware, locale-aware path for a named route. */
export function localizedPath(lang: Lang, route: RouteKey = "home"): string {
  const slug = routeSlugs[route][lang];
  // Default locale has no prefix: `/` and `/book-tandem-flight`
  if (lang === defaultLang) {
    return slug ? `${BASE}/${slug}` : `${BASE}/`;
  }
  return slug ? `${BASE}/${lang}/${slug}` : `${BASE}/${lang}/`;
}

/** Resolve the named route from a request URL via its localized slug. */
export function getRouteFromUrl(url: URL): RouteKey {
  let path = url.pathname;
  if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length);
  const segments = path.split("/").filter(Boolean);
  const maybeLang = segments[0];
  const slug =
    maybeLang && (locales as string[]).includes(maybeLang)
      ? (segments[1] ?? "")
      : (segments[0] ?? "");

  for (const [key, slugs] of Object.entries(routeSlugs) as [
    RouteKey,
    (typeof routeSlugs)[RouteKey],
  ][]) {
    if ((Object.values(slugs) as string[]).includes(slug)) {
      return key;
    }
  }
  return "home";
}
