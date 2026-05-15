import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Choice Events",
    description: "Browse choice events available in Limbus Company Mirror Dungeons.",
    alternates: {
        canonical: "/md-events"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Choice Events",
            description: "Browse choice events available in Limbus Company Mirror Dungeons.",
            url: "https://limbus.eldritchtools.com/md-events"
        })
    ]
};

export default function MdEventsLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}