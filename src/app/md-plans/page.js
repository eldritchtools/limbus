import MdPlansPage from "./MdPlansPage";
import { getPopularMdPlans } from "../database/serverSafeDb";
import { isolateBuildExtraOpts } from "../lib/buildExtraOpts";
import JsonLd from "../lib/jsonLd";

export function generateMetadata() {
    return {
        title: "MD Plans",
        description: "Browse and discover Mirror Dungeon plans shared by the Limbus Company community.",
        alternates: {
            canonical: "/md-plans"
        }
    };
}

const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "MD Plans",
    "url": "https://limbus.eldritchtools.com/md-plans",
    "isPartOf": {
        "@id": "https://limbus.eldritchtools.com/#website"
    }
};

export default async function Page() {
    const plans = await getPopularMdPlans();

    const plansMinified = plans.map(plan => {
        const extraOpts = isolateBuildExtraOpts(plan.extra_opts, ["do", "as", "iu"]);
        const { body, ...rest } = plan;
        return { ...rest, extra_opts: extraOpts };
    });

    return <>
        <JsonLd data={schema} />
        <MdPlansPage popularMdPlans={plansMinified} />
    </>;
}
