import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Daily Randomized Team",
    description: "Get a daily randomized team for Mirror Dungeon and other content in Limbus Company.",
    alternates: {
        canonical: "/daily-random"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Daily Randomized Team",
            description: "Get a daily randomized team for Mirror Dungeon and other content in Limbus Company.",
            url: "https://limbus.eldritchtools.com/daily-random"
        })
    ]
};

export default function DailyRandomizedLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}