import EgosPage from "./EgosPage";

export function generateMetadata() {
    return {
        title: "E.G.Os",
        description: "Browse information on E.G.Os.",
        alternates: {
            canonical: "/egos"
        }
    };
}

export default function Page() {
    return <EgosPage />;
}
