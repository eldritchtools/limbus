import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "MD Events",
    description: "View events that show up in Mirror Dungeons",
    alternates: {
        canonical: "/md-events"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "MD Events",
            description: "View events that show up in Mirror Dungeons",
            url: "https://limbus.eldritchtools.com/md-events"
        })
    ]
};

export default function ThemePacksLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}