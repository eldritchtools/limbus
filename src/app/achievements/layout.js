import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

export const metadata = {
    title: "Achievements",
    description: "Track Mirror Dungeon (MD) achievement progress in Limbus Company and view details and tips for each achievement.",
    alternates: {
        canonical: "/achievements"
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: "Achievements",
            description: "Track Mirror Dungeon (MD) achievement progress in Limbus Company and view details and tips for each achievement.",
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