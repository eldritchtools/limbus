import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Season 7 Popularity Poll",
    description: "Popularity poll for the latest season of Limbus Company.",
    alternates: {
        canonical: "/popularity-poll"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Season 7 Popularity Poll",
            description: "Popularity poll for the latest season of Limbus Company.",
            url: "https://limbus.eldritchtools.com/popularity-poll"
        })
    ]
};


export default function PopularityPollLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}