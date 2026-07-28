import EgoPage from "./EgoPage";
import { NotesTab, SkillsTab } from "./EgoPageComponents";

import { fetchData } from "@/app/components/DataFetcherServer";
import { sinnerIdMapping } from "@/app/lib/constants";
import JsonLd from "@/app/lib/jsonLd";
import { getEgoMetadata } from "@/app/lib/metadataHelper";
import { compileSkillData } from "@/app/lib/skill";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const ego = await getEgoMetadata(id);

    if (!ego) {
        return { title: "E.G.O not found" };
    }

    const fullName = ego ? `[${sinnerIdMapping[Number(id.slice(1, 3))]}] ${ego}` : "E.G.O";

    return {
        title: fullName,
        description: `E.G.O details for ${fullName} in Limbus Company, including stats, effects, notes, and usage information.`,
        alternates: {
            canonical: `/egos/${id}`
        }
    };
}

const schema = async id => {
    const name = await getEgoMetadata(id);
    const fullName = name ? `[${sinnerIdMapping[Number(id.slice(1, 3))]}] ${name}` : "Temporary missing name";

    return {
        "@context": "https://schema.org",
        "@type": "Thing",
        "@id": `https://limbus.eldritchtools.com/egos/${id}`,
        "name": fullName,
        "url": `https://limbus.eldritchtools.com/egos/${id}`,
        "isPartOf": {
            "@id": "https://limbus.eldritchtools.com/#website"
        }
    }
};

export default async function Page({ params }) {
    const { id } = await params;
    const [schemaData, egos, individualData] = await Promise.all([
        schema(id),
        fetchData("egos"),
        fetchData(`egos/${id}`)
    ]);

    if (!(id in egos))
        return <>
            <JsonLd data={schemaData} />
            <span className="title-text">E.G.O not found</span>
        </>;

    const skillData = compileSkillData("ego", egos[id], individualData);
    const notesTab = skillData ? <NotesTab notes={skillData.notes} /> : null;
    const initSkillsTab = <SkillsTab
        awakeningSkills={skillData.awakeningSkills} corrosionSkills={skillData.corrosionSkills}
        passives={skillData.passives} compareMode={false} serverText={true}
    />

    return <>
        <JsonLd data={schemaData} />
        <EgoPage id={id} egoData={egos[id]} initSkillData={skillData} notesTab={notesTab} initSkillsTab={initSkillsTab} />
    </>;
}
