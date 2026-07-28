import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

const name = "Achievements";
const desc = "Track Mirror Dungeon (MD) achievement progress in Limbus Company and view details and tips for each achievement.";
const path = "/achievements";

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

export default function AchievementsLayout({ children }) {
    return <>
        <JsonLd data={schema} />
        {children}
    </>
}