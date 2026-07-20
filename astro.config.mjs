// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import { defaultLang, locales } from './src/i18n/config.ts';
import { createSitemapSerialize } from './src/i18n/sitemap.ts';

const site = 'https://airadventure.it';
const base = '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,

  i18n: {
    locales: [...locales],
    defaultLocale: defaultLang,
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: defaultLang,
        locales: Object.fromEntries(locales.map((lang) => [lang, lang])),
      },
      serialize: createSitemapSerialize(site, base),
    }),
  ],
});
