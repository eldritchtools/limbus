import BuildsSearchDisplay from "../components/contentCardDisplays/BuildsSearchDisplay";
import CollectionsSearchDisplay from "../components/contentCardDisplays/CollectionsSearchDisplay";
import MdPlansSearchDisplay from "../components/contentCardDisplays/MdPlansSearchDisplay";
import { getSavedBuilds, searchBuilds } from "../database/builds";
import { getSavedCollections, searchCollections } from "../database/collections";
import { localStores } from "../database/localDB";
import { getSavedMdPlans, searchMdPlans } from "../database/mdPlans";

export const contentConfig = {
    builds: {
        search: searchBuilds,
        getSaved: getSavedBuilds,
        local: localStores["builds"],
        localSaved: localStores["savedBuilds"],
        idKey: "buildIds",
        str: "builds",
        content: builds => <BuildsSearchDisplay builds={builds} />
    },
    collections: {
        search: searchCollections,
        getSaved: getSavedCollections,
        local: localStores["collections"],
        localSaved: localStores["savedCollections"],
        idKey: "collectionIds",
        str: "collections",
        content: collections => <CollectionsSearchDisplay collections={collections} />
    },
    md_plans: {
        search: searchMdPlans,
        getSaved: getSavedMdPlans,
        local: localStores["mdPlans"],
        localSaved: localStores["savedMdPlans"],
        idKey: "planIds",
        str: "md plans",
        content: plans => <MdPlansSearchDisplay plans={plans} />
    }
};
