import { SITE_URL } from "../lib/sitemapHelper";

export function GET() {
  return new Response(
`User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap_index.xml
`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  );
}
