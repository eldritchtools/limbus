import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Timers",
    description: "Relevant timers for when content is ending or since content was released",
    alternates: {
        canonical: "/timers"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Timers",
            description: "Relevant timers for when content is ending or since content was released",
            url: "https://limbus.eldritchtools.com/timers"
        })
    ]
};

export default function TimersLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}