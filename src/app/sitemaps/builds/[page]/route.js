import { getBuildsForSitemap } from '@/app/database/builds';
import { SITE_URL, CHUNK_SIZE, buildUrlSet } from "@/app/lib/sitemapHelper";

export async function GET(_, { params }) {
    const page = Number((await params).page);
    if (!page || page < 1) {
        return new Response('Invalid page', { status: 400 });
    }

    const builds = await getBuildsForSitemap(page, CHUNK_SIZE);

    if (builds.length === 0) {
        return new Response('Not found', { status: 404 });
    }

    const urls = builds.map((b) => ({
        loc: `${SITE_URL}/builds/${b.id}`,
        lastmod: b.updated_at.split('T')[0],
    }));

    return new Response(buildUrlSet(urls), {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400',
        },
    });
}
