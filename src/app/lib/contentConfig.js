import BuildsSearchDisplay from "../components/contentCardDisplays/BuildsSearchDisplay";
import CollectionsSearchDisplay from "../components/contentCardDisplays/CollectionsSearchDisplay";
import MdPlansSearchDisplay from "../components/contentCardDisplays/MdPlansSearchDisplay";
import { deleteBuild, getSavedBuilds, searchBuilds } from "../database/builds";
import { deleteCollection, getSavedCollections, searchCollections } from "../database/collections";
import { localStores } from "../database/localDB";
import { deleteMdPlan, getSavedMdPlans, searchMdPlans } from "../database/mdPlans";

const buildsConfig = {
    search: searchBuilds,
    getSaved: getSavedBuilds,
    delete: deleteBuild,
    local: localStores["builds"],
    localSaved: localStores["savedBuilds"],
    idKey: "buildIds",
    str: "builds",
    content: builds => <BuildsSearchDisplay builds={builds} />,
    path: "builds"
};

const collectionsConfig = {
    search: searchCollections,
    getSaved: getSavedCollections,
    delete: deleteCollection,
    local: localStores["collections"],
    localSaved: localStores["savedCollections"],
    idKey: "collectionIds",
    str: "collections",
    content: collections => <CollectionsSearchDisplay collections={collections} />,
    path: "collections"
};

const mdPlansConfig = {
    search: searchMdPlans,
    getSaved: getSavedMdPlans,
    delete: deleteMdPlan,
    local: localStores["mdPlans"],
    localSaved: localStores["savedMdPlans"],
    idKey: "planIds",
    str: "md plans",
    content: plans => <MdPlansSearchDisplay plans={plans} />,
    path: "md-plans"
};

export const contentConfig = {
    builds: buildsConfig, build: buildsConfig,
    collections: collectionsConfig, collection: collectionsConfig,
    md_plans: mdPlansConfig, md_plan: mdPlansConfig
};
