import JsonLd, { getAppSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Floor Planner | Limbus Company Tools",
    description: "Quickly select floors to see what theme packs you can still go to."
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