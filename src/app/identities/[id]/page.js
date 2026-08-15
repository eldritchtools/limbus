import IdentityPage from "./IdentityPage";
import { NotesTab, SkillsTab } from "./IdentityPageComponents";

import { fetchData } from "@/app/components/DataFetcherServer";
import { getIdentityArtSrc } from "@/app/components/icons/imgSrc";
import { LEVEL_CAP, sinnerIdMapping } from "@/app/lib/constants";
import JsonLd from "@/app/lib/jsonLd";
import { getIdentityMetadata } from "@/app/lib/metadataHelper";
import { compileSkillData } from "@/app/lib/skill";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const identity = await getIdentityMetadata(id);

    if (!identity) {
        return { title: "Identity not found" };
    }

    const fullName = `[${sinnerIdMapping[Number(id.slice(1, 3))]}] ${identity}`;
    const desc = `Identity details for ${fullName} in Limbus Company, including stats, effects, notes, and usage information.`;
    const path = `/identities/${id}`;
    const img = getIdentityArtSrc(id, true);

    return {
        title: fullName,
        description: desc,
        alternates: {
            canonical: path
        },

        openGraph: {
            title: fullName,
            description: desc,
            url: path,
            type: "website",
            images: [{url: img, alt: fullName}]
        },

        twitter: {
            card: "summary_large_image",
            title: fullName,
            description: desc,
            images: [img]
        }
    };
}

const schema = async id => {
    const name = await getIdentityMetadata(id);
    const fullName = name ? `[${sinnerIdMapping[Number(id.slice(1, 3))]}] ${name}` : "Temporary missing name";

    return {
        "@context": "https://schema.org",
        "@type": "Thing",
        "@id": `https://limbus.eldritchtools.com/identities/${id}`,
        "name": fullName,
        "url": `https://limbus.eldritchtools.com/identities/${id}`,
        "isPartOf": {
            "@id": "https://limbus.eldritchtools.com/#website"
        }
    }
};

export default async function Page({ params }) {
    const { id } = await params;
    const [schemaData, identities, individualData, egos] = await Promise.all([
        schema(id),
        fetchData("identities"),
        fetchData(`identities/${id}`),
        fetchData("egos_mini")
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

    const sinnerId = identities[id].sinnerId;

    const minifiedIdentities = Object.entries(identities)
        .map(([id, data]) => {
            const { name, rank, sinnerId, tags } = data;
            return [id, { id, name, rank, sinnerId, tags }]
        })
        .filter(([, data]) => data.sinnerId === sinnerId)
        .sort(([aid], [bid]) => bid.localeCompare(aid));

    const minifiedEgos = Object.entries(egos)
        .map(([id, data]) => {
            const { name, rank, sinnerId } = data;
            return [id, { id, name, rank, sinnerId }]
        })
        .filter(([, data]) => data.sinnerId === sinnerId)
        .sort(([aid], [bid]) => bid.localeCompare(aid));

    return <>
        <JsonLd data={schemaData} />
        <IdentityPage 
            id={id} identityData={identities[id]} initSkillData={skillData} 
            notesTab={notesTab} initSkillsTab={initSkillsTab} 
            minifiedIdentities={minifiedIdentities} minifiedEgos={minifiedEgos}
        />
    </>;
}
