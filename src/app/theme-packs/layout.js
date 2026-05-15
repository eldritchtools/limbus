import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Theme Packs",
    description: "Browse theme packs available in Limbus Company Mirror Dungeons.",
    alternates: {
        canonical: "/theme-packs"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Theme Packs",
            description: "Browse theme packs available in Limbus Company Mirror Dungeons.",
            url: "https://limbus.eldritchtools.com/theme-packs"
        })
    ]
};

export default function ThemePacksLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}