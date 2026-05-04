import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Achievements | Limbus Company Tools",
    description: "View and track achievement progress or tips"
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Achievements",
            description: "View and track achievement progress or tips",
            url: "https://limbus.eldritchtools.com/achievements"
        })
    ]
};


export default function AchievementsLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}