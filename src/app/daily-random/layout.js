import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Daily Randomized Team | Limbus Company Tools",
    description: "A daily randomized team for running mirror dungeons or other content"
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Daily Randomized Team",
            description: "A daily randomized team for running mirror dungeons or other content",
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