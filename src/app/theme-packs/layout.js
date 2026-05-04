import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Theme Packs | Limbus Company Tools",
    description: "View theme packs that show up in Mirror Dungeons"
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Theme Packs",
            description: "View theme packs that show up in Mirror Dungeons",
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