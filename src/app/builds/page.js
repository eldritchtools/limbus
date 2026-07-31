import BuildsPage from "./BuildsPage";
import { getActiveBuilds } from "../database/serverSafeDb";
import { isolateBuildExtraOpts } from "../lib/buildExtraOpts";
import JsonLd from "../lib/jsonLd";

export function generateMetadata() {
    const name = "Team Builds";
    const desc = "Browse and discover team builds shared by the Limbus Company community.";
    const path = "/builds";

    return {
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
}

const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Team Builds",
    "url": "https://limbus.eldritchtools.com/builds",
    "isPartOf": {
        "@id": "https://limbus.eldritchtools.com/#website"
    }
};


export default async function Page() {
    const builds = await getActiveBuilds();

    const buildsMinified = builds.map(build => {
        const extraOpts = isolateBuildExtraOpts(build.extra_opts, ["iu", "ai", "is"]);
        const { ego_ids, ...rest } = build;
        return { ...rest, extra_opts: extraOpts };
    });

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "0.5rem" }}>
        <JsonLd data={schema} />
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Team Builds</h1>
        <p style={{ margin: 0 }}>Browse community-created team builds. </p>
        <p className="sub-text" style={{ margin: 0 }}>Discover teams for general content, Mirror Dungeon, Railway, Luxcavation, story battles, and specific encounters. Explore popular builds, see the latest submissions, or find strategies for individual boss fights.</p>
        <BuildsPage activeBuilds={buildsMinified} />
    </div>;
}
