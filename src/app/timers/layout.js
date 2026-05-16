import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Timers and Roadmap",
    description: "Timers for content dates, seasonal roadmap, and time since releases in Limbus Company.",
    alternates: {
        canonical: "/timers"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Timers",
            description: "Timers for content dates, seasonal roadmap, and time since releases in Limbus Company.",
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