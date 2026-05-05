import BuildsPage from "./BuildsPage";

export function generateMetadata() {
    return {
        title: "Team Builds",
        description: "Browse team builds shared by users.",
        alternates: {
            canonical: "/builds"
        }
    };
}

export default function Page() {
    return <BuildsPage />;
}
