import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "Lunacy Calculator";
const desc = "Calculate your projected Lunacy based on unclaimed rewards and recurring sources of income.";
const path = "/lunacy-calc";

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
        getAppSchema({
            name: name,
            description: desc,
            url: `https://limbus.eldritchtools.com${path}`
        })
    ]
};

export default function LunacyCalculatorLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}