import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Floor Planner",
    description: "Plan Limbus Company Mirror Dungeon floor routes by selecting theme packs and viewing available exclusive gifts.",
    alternates: {
        canonical: "/floor-planner"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getAppSchema({
            name: "Floor Planner",
            description: "Plan Limbus Company Mirror Dungeon floor routes by selecting theme packs and viewing available exclusive gifts.",
            url: "https://limbus.eldritchtools.com/floor-planner"
        })
    ]
};

export default function FloorPlannerLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}