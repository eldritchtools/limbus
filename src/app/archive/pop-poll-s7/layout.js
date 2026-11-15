import JsonLd, { getWebPageSchema } from "@/app/lib/jsonLd";

export const metadata = {
    title: "Season 7 Popularity Poll",
    description: "Popularity poll for season 7 of Limbus Company.",
    alternates: {
        canonical: "/archive/pop-poll-s7"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Season 7 Popularity Poll",
            description: "Popularity poll for season 7 of Limbus Company.",
            url: "https://limbus.eldritchtools.com/archive/pop-poll-s7"
        })
    ]
};


export default function PopularityPollLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}