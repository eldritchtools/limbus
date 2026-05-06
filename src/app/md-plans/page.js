import MdPlansPage from "./MdPlansPage";

export function generateMetadata() {
    return {
        title: "MD Plans",
        description: "Browse MD Plans shared by users",
        alternates: {
            canonical: "/md-plans"
        }
    };
}

export default function Page() {
    return <MdPlansPage />;
}
