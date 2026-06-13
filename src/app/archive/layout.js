import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Archive",
    description: "Archive of old pages for past events.",
    alternates: {
        canonical: "/archive"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getAppSchema({
            name: "Archive",
            description: "Archive of old pages for past events.",
            url: "https://limbus.eldritchtools.com/archive"
        })
    ]
};

export default function ArchiveLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}