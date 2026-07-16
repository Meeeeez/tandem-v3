import type { SitemapItem } from "@astrojs/sitemap";
import {
  defaultLang,
  locales,
  routeSlugs,
  type Lang,
  type RouteKey,
} from "./config";

type AlternateLink = { url: string; lang: Lang };

/** Absolute URL for a named route in a given locale (trailing slash). */
function absoluteLocalizedUrl(
  site: string,
  base: string,
  lang: Lang,
  route: RouteKey,
): string {
  const root = `${site}${base}`;
  const slug = routeSlugs[route][lang];
  if (lang === defaultLang) {
    return slug ? `${root}/${slug}/` : `${root}/`;
  }
  return slug ? `${root}/${lang}/${slug}/` : `${root}/${lang}/`;
}

/**
 * Build a `@astrojs/sitemap` serialize hook that attaches `xhtml:link`
 * alternates for translated slugs (the built-in i18n option only matches
 * identical paths after the locale prefix).
 */
export function createSitemapSerialize(site: string, base: string) {
  const alternateLinksByUrl = new Map<string, AlternateLink[]>();

  for (const route of Object.keys(routeSlugs) as RouteKey[]) {
    const links = locales.map((lang) => ({
      url: absoluteLocalizedUrl(site, base, lang, route),
      lang,
    }));
    for (const link of links) {
      alternateLinksByUrl.set(link.url, links);
    }
  }

  return (item: SitemapItem): SitemapItem => {
    const links = alternateLinksByUrl.get(item.url);
    if (links) {
      item.links = links;
    }
    return item;
  };
}
