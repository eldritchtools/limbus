import CollectionsPage from "./CollectionsPage";

export function generateMetadata() {
    return {
        title: "Collections",
        description: "Browse collections of content managed by users.",
        alternates: {
            canonical: "/collections"
        }
    };
}

export default function Page() {
    return <CollectionsPage />;
}
