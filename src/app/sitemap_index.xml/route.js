import { getBuildsCountForSitemap } from '../database/builds';
import { getCollectionsCountForSitemap } from '../database/collections';
import { getMdPlansCountForSitemap } from '../database/mdPlans';

import { SITE_URL, CHUNK_SIZE } from "@/app/lib/sitemapHelper";

export async function GET() {
    const today = new Date().toISOString().split('T')[0];

    const buildPages = Math.ceil((await getBuildsCountForSitemap()) / CHUNK_SIZE);
    const collectionPages = Math.ceil((await getCollectionsCountForSitemap()) / CHUNK_SIZE);
    const mdPlanPages = Math.ceil((await getMdPlansCountForSitemap()) / CHUNK_SIZE);

    const sitemaps = [
        `${SITE_URL}/sitemaps/pages.xml`,
        ...Array.from({ length: buildPages }, (_, i) =>
            `${SITE_URL}/sitemaps/builds/${i + 1}`
        ),
        ...Array.from({ length: collectionPages }, (_, i) =>
            `${SITE_URL}/sitemaps/collections/${i + 1}`
        ),
        ...Array.from({ length: mdPlanPages }, (_, i) =>
            `${SITE_URL}/sitemaps/md-plans/${i + 1}`
        ),
        `${SITE_URL}/sitemaps/identities.xml`,
        `${SITE_URL}/sitemaps/egos.xml`
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((loc) => `
  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
    ).join('')}
</sitemapindex>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400',
        },
    });
}
