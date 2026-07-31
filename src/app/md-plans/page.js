import MdPlansPage from "./MdPlansPage";
import { getActiveMdPlans } from "../database/serverSafeDb";
import { isolateBuildExtraOpts } from "../lib/buildExtraOpts";
import JsonLd from "../lib/jsonLd";

const name = "MD Plans";
const desc = "Browse and discover Mirror Dungeon plans shared by the Limbus Company community.";
const path = "/md-plans";

export const metadata = {
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

const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "url": `https://limbus.eldritchtools.com${path}`,
    "isPartOf": {
        "@id": "https://limbus.eldritchtools.com/#website"
    }
};

export default async function Page() {
    const plans = await getActiveMdPlans();

    const plansMinified = plans.map(plan => {
        const extraOpts = isolateBuildExtraOpts(plan.extra_opts, ["do", "as", "iu"]);
        const { body, ...rest } = plan;
        return { ...rest, extra_opts: extraOpts };
    });

    return <>
        <JsonLd data={schema} />
        <MdPlansPage activeMdPlans={plansMinified} />
    </>;
}
