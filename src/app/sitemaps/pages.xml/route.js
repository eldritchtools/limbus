import { buildUrlSet, SITE_URL } from "@/app/lib/sitemapHelper";

export async function GET() {
    const today = new Date().toISOString().split('T')[0];

    const urls = [
        { loc: `${SITE_URL}/`, lastmod: today },
        { loc: `${SITE_URL}/builds`, lastmod: today },
        { loc: `${SITE_URL}/md-plans`, lastmod: today },
        { loc: `${SITE_URL}/collections`, lastmod: today },
        { loc: `${SITE_URL}/identities`, lastmod: today },
        { loc: `${SITE_URL}/egos`, lastmod: today },
        { loc: `${SITE_URL}/achievements`, lastmod: today },
        { loc: `${SITE_URL}/gifts`, lastmod: today },
        { loc: `${SITE_URL}/fusions`, lastmod: today },
        { loc: `${SITE_URL}/theme-packs`, lastmod: today },
        { loc: `${SITE_URL}/md-events`, lastmod: today },
        { loc: `${SITE_URL}/universal`, lastmod: today },
        { loc: `${SITE_URL}/daily-random`, lastmod: today },
        { loc: `${SITE_URL}/training-calc`, lastmod: today },
        { loc: `${SITE_URL}/keyword-solver`, lastmod: today },
        { loc: `${SITE_URL}/team-randomizer`, lastmod: today },
        { loc: `${SITE_URL}/floor-planner`, lastmod: today },
        { loc: `${SITE_URL}/about`, lastmod: today },
        { loc: `${SITE_URL}/supporters`, lastmod: today }
    ];

    return new Response(buildUrlSet(urls), {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400',
        },
    });
}
