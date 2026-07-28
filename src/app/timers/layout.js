import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

const name = "Timers and Roadmap";
const desc = "Timers for content dates, seasonal roadmap, and time since releases in Limbus Company.";
const path = "/timers"

export const metadata = {
    title: name,
    description: desc,
    alternates: {
        canonical: path
    },
    openGraph: {
        title: name,
        description: desc,
        url: path,
        type: "website",
    },

    twitter: {
        card: "summary",
        title: name,
        description: desc
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: name,
            description: desc,
            url: `https://limbus.eldritchtools.com${path}`
        })
    ]
};

export default function TimersLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}