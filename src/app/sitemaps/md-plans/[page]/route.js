import { getMdPlansForSitemap } from "@/app/database/mdPlans";
import { SITE_URL, CHUNK_SIZE, buildUrlSet } from "@/app/lib/sitemapHelper";

export async function GET(_, { params }) {
    const page = Number((await params).page);
    if (!page || page < 1) {
        return new Response('Invalid page', { status: 400 });
    }

    const mdPlans = await getMdPlansForSitemap(page, CHUNK_SIZE);

    if (mdPlans.length === 0) {
        return new Response('Not found', { status: 404 });
    }

    const urls = mdPlans.map((m) => ({
        loc: `${SITE_URL}/md-plans/${m.id}`,
        lastmod: m.updated_at.split('T')[0],
    }));

    return new Response(buildUrlSet(urls), {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400',
        },
    });
}
