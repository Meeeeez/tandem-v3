// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://meeeeez.github.io',
    base: '/tandem-v3',
    i18n: {
        locales: ['en', 'de', 'it'],
        defaultLocale: 'en',
        routing: {
          prefixDefaultLocale: true,
          // The root `/` redirect is handled explicitly by src/pages/index.astro
          // so it works reliably on static hosting (GitHub Pages).
          redirectToDefaultLocale: false
        },
      },
});
