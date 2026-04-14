import { getCollectionsForSitemap } from "@/app/database/collections";
import { SITE_URL, CHUNK_SIZE, buildUrlSet } from "@/app/lib/sitemapHelper";

export async function GET(_, { params }) {
    const page = Number((await params).page);
    if (!page || page < 1) {
        return new Response('Invalid page', { status: 400 });
    }

    const collections = await getCollectionsForSitemap(page, CHUNK_SIZE);

    if (collections.length === 0) {
        return new Response('Not found', { status: 404 });
    }

    const urls = collections.map((c) => ({
        loc: `${SITE_URL}/collections/${c.id}`,
        lastmod: c.updated_at.split('T')[0],
    }));

    return new Response(buildUrlSet(urls), {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400',
        },
    });
}
