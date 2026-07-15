import IdentityPage from "./IdentityPage";
import { NotesTab, SkillsTab } from "./IdentityPageComponents";

import { fetchData } from "@/app/components/DataFetcherServer";
import { LEVEL_CAP } from "@/app/lib/constants";
import JsonLd from "@/app/lib/jsonLd";
import { getIdentityMetadata } from "@/app/lib/metadataHelper";
import { compileSkillData } from "@/app/lib/skill";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const identity = await getIdentityMetadata(id);

    if (!identity) {
        return { title: "Identity not found" };
    }

    return {
        title: identity ?? "Identity",
        description: `Identity details for ${identity} in Limbus Company, including stats, effects, notes, and usage information.`,
        alternates: {
            canonical: `/identities/${id}`
        }
    };
}

const schema = async id => {
    const identity = (await getIdentityMetadata(id)) ?? "Temporary missing name";

    return {
        "@context": "https://schema.org",
        "@type": "Thing",
        "@id": `https://limbus.eldritchtools.com/identities/${id}`,
        "name": identity,
        "url": `https://limbus.eldritchtools.com/identities/${id}`,
        "isPartOf": {
            "@id": "https://limbus.eldritchtools.com/#website"
        }
    }
};

export default async function Page({ params }) {
    const { id } = await params;
    const [schemaData, identities, individualData] = await Promise.all([
        schema(id),
        fetchData("identities"),
        fetchData(`identities/${id}`)
    ]);

    if (!(id in identities))
        return <>
            <JsonLd data={schemaData} />
            <span className="title-text">Identity not found</span>
        </>;

    const skillData = compileSkillData("identity", identities[id], individualData);
    const notesTab = skillData ? <NotesTab notes={skillData.notes} /> : null;
    const initSkillsTab = <SkillsTab
        identityData={identities[id]} level={LEVEL_CAP}
        skills={skillData.skills} 
        combatPassives={skillData.combatPassives} supportPassives={skillData.supportPassives}
        compareMode={false} serverText={true}
    />

    return <>
        <JsonLd data={schemaData} />
        <IdentityPage params={params} identityData={identities[id]} initSkillData={skillData} notesTab={notesTab} initSkillsTab={initSkillsTab}/>
    </>;
}
