import "./globals.css";
import Script from "next/script";

import LayoutComponent from "./layoutComponent";

export const metadata = {
    title: "Limbus Company Tools",
    description: "Use different tools made for the game Limbus Company or view team builds created by other users.",
    metadataBase: new URL("https://limbus.eldritchtools.com")
};


export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/favicon.ico" />
                <Script async src="https://www.googletagmanager.com/gtag/js?id=G-HJ0SH2TDC8" />
                <Script id="google-analytics">
                    {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', 'G-HJ0SH2TDC8', {page_path: window.location.pathname});
                    `}
                </Script>
            </head>
            <body style={{ display: "flex", flexDirection: "column" }}>
                <LayoutComponent>{children}</LayoutComponent>
            </body>
        </html>
    );
}
