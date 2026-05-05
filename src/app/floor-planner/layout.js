import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Floor Planner",
    description: "Quickly select floors to see what theme packs you can still go to.",
    alternates: {
        canonical: "/floor-planner"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getAppSchema({
            name: "Floor Planner",
            description: "Quickly select floors to see what theme packs you can still go to for the game Limbus Company.",
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