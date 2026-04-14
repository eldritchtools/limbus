export const SITE_URL = 'https://limbus.eldritchtools.com';
export const ASSETS_URL = 'https://limbus-assets.eldritchtools.com';
export const CHUNK_SIZE = 2000;

export function buildUrlSet(urls) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `
  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`
    ).join('')}
</urlset>`;
}
