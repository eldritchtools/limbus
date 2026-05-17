import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';

import ChunkErrorHandler from "./ChunkErrorHandler";
import LayoutComponent from "./layoutComponent";
import { gaId } from "./lib/gaEvents";
import JsonLd, { getOrganizationSchema, getWebsiteSchema } from "./lib/jsonLd";

export const metadata = {
    metadataBase: new URL("https://limbus.eldritchtools.com"),
    title: {
        default: "Limbus Company Tools",
        template: "%s | Limbus Company Tools",
    },
    description: "Limbus Company tools for team builds, Mirror Dungeon planning, Identity and E.G.O database with user ratings, achievement tracking, calculators, and planners."
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getOrganizationSchema(),
        getWebsiteSchema()
    ]
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/favicon.ico" />
                {/* <Script async src="https://www.googletagmanager.com/gtag/js?id=G-HJ0SH2TDC8" />
                <Script id="google-analytics">
                    {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', 'G-HJ0SH2TDC8', {page_path: window.location.pathname});
                    `}
                </Script> */}
                <JsonLd data={schema} />
            </head>
            <body style={{ display: "flex", flexDirection: "column" }}>
                {gaId && <GoogleAnalytics gaId={gaId} />}
                <ChunkErrorHandler />
                <LayoutComponent>{children}</LayoutComponent>
            </body>
        </html>
    );
}
