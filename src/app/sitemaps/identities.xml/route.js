import { ASSETS_URL, buildUrlSet, SITE_URL } from "@/app/lib/sitemapHelper";

export async function GET() {
    try {
        const res = await fetch(`${ASSETS_URL}/data/identities.json`, { headers: { 'Accept': 'application/json', 'User-Agent': 'sitemap-generator' } });

        if (!res.ok) throw new Error(`Upstream ${res.status}`);

        const data = await res.json();

        const urls = Object.keys(data).map((b) => ({
            loc: `${SITE_URL}/identities/${b}`,
        }));

        return new Response(buildUrlSet(urls), {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch {
        // Return a valid (empty) sitemap instead of 500
        return new Response(buildUrlSet([]), {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=300',
            },
        });
    }
}
