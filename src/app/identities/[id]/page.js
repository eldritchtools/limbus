import IdentityPage from "./IdentityPage";

import { getIdentitiesForMetadata } from "@/app/lib/metadataHelper";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const identity = (await getIdentitiesForMetadata())[String(id)];

    if (!identity) {
        return { title: "Identity not found" };
    }

    return {
        title: identity ?? "Identity",
        description: `Information for the identity ${identity}`,
        alternates: {
            canonical: `/identities/${id}`
        }
    };
}

export default function Page({ params }) {
    return <IdentityPage params={params} />;
}
