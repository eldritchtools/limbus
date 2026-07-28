import JsonLd, { getAppSchema } from "../lib/jsonLd";

const name = "Floor Planner";
const desc = "Plan Limbus Company Mirror Dungeon floor routes by selecting theme packs and viewing available exclusive gifts.";
const path = "/floor-planner";

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
            title: name,
            description: desc,
            url: `https://limbus.eldritchtools.com${path}`
        })
    ]
};

export default function FloorPlannerLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}