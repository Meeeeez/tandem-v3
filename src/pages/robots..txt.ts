import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const sitemapUrl = new URL(`${base}/sitemap-index.xml`, site);

  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl.href}\n`,
    { headers: { 'Content-Type': 'text/plain' } }
  );
};