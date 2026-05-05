import IdentitiesPage from "./IdentitiesPage";

export function generateMetadata() {
    return {
        title: "Identities",
        description: "Browse information on identities",
        alternates: {
            canonical: "/identities"
        }
    };
}

export default function Page() {
    return <IdentitiesPage />;
}
