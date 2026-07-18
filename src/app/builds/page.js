import BuildsPage from "./BuildsPage";
import { getPopularBuilds } from "../database/serverSafeDb";
import { isolateBuildExtraOpts } from "../lib/buildExtraOpts";
import JsonLd from "../lib/jsonLd";

export function generateMetadata() {
    return {
        title: "Team Builds",
        description: "Browse and discover team builds shared by the Limbus Company community.",
        alternates: {
            canonical: "/builds"
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
    const builds = await getPopularBuilds();

    const buildsMinified = builds.map(build => {
        const extraOpts = isolateBuildExtraOpts(build.extra_opts, ["iu", "ai", "is"]);
        const { ego_ids, ...rest } = build;
        return { ...rest, extra_opts: extraOpts };
    });

    return <>
        <JsonLd data={schema} />
        <BuildsPage popularBuilds={buildsMinified} />
    </>;
}
