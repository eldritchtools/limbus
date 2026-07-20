import MdPlanPage from "./MdPlanPage";
import { MdPlanPageLocalWrapper } from "./MdPlanPageComponents";

import { fetchData } from "@/app/components/DataFetcherServer";
import { getMdPlan } from "@/app/database/serverSafeDb";
import { isUuid } from "@/app/database/uuidCheck";
import JsonLd, { getArticleSchema } from "@/app/lib/jsonLd";
import { cleanMetadataDescription } from "@/app/lib/metadataHelper";

const MIN_INDEXABLE_DESCRIPTION = 150;

function getTotalDescriptionLength(plan) {
    return plan.body.length;
}

export async function generateMetadata({ params }) {
    const { id } = await params;

    let data;
    try {
        data = await getMdPlan(id);
    } catch (e) {
        return {
            title: "Not found",
            robots: { index: false },
        };
    }

    // if (status === "error") {
    //     return {
    //         title: "MD Plan",
    //         description: "Temporary issue loading title.",
    //         alternates: {
    //             canonical: `/md-plans/${id}`
    //         }
    //     };
    // }

    return {
        title: data.title ?? "MD Plan",
        description: cleanMetadataDescription(data.body),
        alternates: {
            canonical: `/md-plans/${id}`
        },
        robots: {
            index: getTotalDescriptionLength(data) >= MIN_INDEXABLE_DESCRIPTION,
            follow: true,
        }
    };
}

const schema = (id, data) => {
    let schemaData = {
        targetType: "md_plans",
        targetId: id
    };

    if (!data) {
        schemaData.title = "Not found";
        // } else if (status === "error") {
        //     schemaData.title = "MD Plan";
        //     schemaData.description = "Temporary issue loading content.";
    } else {
        schemaData.title = data.title ?? "MD Plan";
        if (data.username) schemaData.username = data.username;
        schemaData.description = cleanMetadataDescription(data.body);
        schemaData.published_at = data.published_at ?? data.created_at;
        schemaData.updated_at = data.updated_at;
    }

    return {
        "@context": "https://schema.org",
        "@graph": [
            getArticleSchema(schemaData)
        ]
    }
};

export default async function Page({ params }) {
    const { id } = await params;

    if (isUuid(id)) return <MdPlanPageLocalWrapper id={id} />

    let plan, gifts, themePacks;

    try {
        [plan, gifts, themePacks] = await Promise.all([
            getMdPlan(id),
            fetchData("gifts"),
            fetchData("md_theme_packs")
        ])
    } catch (e) {
        plan = null;
    }

    const schemaData = schema(id, plan);

    const giftIds = new Set();
    const themePackIds = new Set();

    plan.start_gift_ids.forEach(x => giftIds.add(x));
    plan.observe_gift_ids.forEach(x => giftIds.add(x));
    plan.target_gift_ids.forEach(x => giftIds.add(x));
    plan.floors.forEach(floor => {
        floor.gifts.forEach(x => giftIds.add(Number(x)));
        floor.themePacks.forEach(x => themePackIds.add(x));
    });

    const minifiedGifts = Object.fromEntries(
        Object.entries(gifts)
            .filter(([id]) => giftIds.has(Number(id)))
            .map(([giftId, gift]) => {
                const { id, names, srcPath, tier, keyword } = gift;
                return [giftId, { id, names: names.slice(0, 1), srcPath, tier, keyword }]
            })
    )

    const minifiedThemePacks = Object.fromEntries(
        Object.entries(themePacks)
            .filter(([id]) => themePackIds.has(id))
            .map(([themePackId, themePack]) => {
                const { name, image, overlayImage } = themePack;
                const obj = { id: themePackId, name, image };
                if (overlayImage) obj.overlayImage = overlayImage;
                return [themePackId, obj];
            })
    )

    return <>
        <JsonLd data={schemaData} />
        <MdPlanPage id={id} plan={plan} giftsData={minifiedGifts} themePacksData={minifiedThemePacks} />
    </>;
}
