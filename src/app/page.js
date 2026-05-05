import HomePage from "./HomePage";

export function generateMetadata() {
    return {
        title: "Limbus Company Tools",
        description: "Community-driven tools and resources for Limbus Company, including calculators, builds, and references.",
        alternates: {
            canonical: "/"
        }
    };
}

export default function Page() {
    return <HomePage />;
}
