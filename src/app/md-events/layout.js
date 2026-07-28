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
    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "1rem", justifyContent: "start" }}>
        <JsonLd data={schema} />

        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Choice Events</h1>
        <p style={{ margin: 0 }}>
            Browse all Mirror Dungeon Choice Events.
        </p>
        <p className="sub-text" style={{ margin: 0 }}>
            Search by title, gift rewards, or choice text, and view the effects of every available outcome.
        </p>
        {children}
    </div>
}