import HomePage from "./HomePage";

export function generateMetadata() {
    return {
        title: "Limbus Company Tools",
        description: "Limbus Company tools for team builds, Mirror Dungeon planning, Identity and E.G.O database with user ratings, achievement tracking, calculators, and planners.",
        alternates: {
            canonical: "/"
        }
    };
}

export default function Page() {
    return <HomePage />;
}
