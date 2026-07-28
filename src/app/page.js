import HomePage from "./HomePage";

export function generateMetadata() {
    const name = "Limbus Company Tools";
    const desc = "Limbus Company tools for team builds, Mirror Dungeon planning, Identity and E.G.O database with user ratings, achievement tracking, calculators, and planners."
    
    return {
        title: name,
        description: desc,
        alternates: {
            canonical: "/"
        },
        openGraph: {
            title: name,
            description: desc,
            url: "/",
            type: "website",
        },

        twitter: {
            card: "summary",
            title: name,
            description: desc
        }
    };
}

export const revalidate = 300;

export default function Page() {
    return <HomePage />;
}
