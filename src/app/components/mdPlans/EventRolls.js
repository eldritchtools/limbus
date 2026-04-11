import BuildDisplayMenuCard from "../build/BuildDisplayMenuCard";
import { useSkillData } from "../dataHooks/skills";
import { useData } from "../DataProvider";
import KeywordIcon from "../icons/KeywordIcon";
import DropdownButton from "../objects/DropdownButton";

import { affinities } from "@/app/lib/constants";
import useLocalState from "@/app/lib/useLocalState";

export default function EventRolls({ identityIds, identityUpties, deploymentOrder }) {
    const [mode, setMode] = useLocalState("eventRollsMode", "all");
    const [identities, identitiesLoading] = useData("identities");
    const skillData = useSkillData(
        "identity", 
        identityIds.filter(x => x && x !== ""), 
        identityUpties ? identityUpties.map(x => x === "" ? 4 : x) : 4
    );

    if (identitiesLoading) return null;

    const values = identityIds.reduce((acc, id, i) => {
        if (!id) return acc;
        const identity = identities[id];
        if(!identity || !(id in skillData) || skillData[id].skills.length === 0) return acc;

        const addToAcc = () => {
            identity.skillTypes.forEach(skill => {
                if (!skill.num) return;
                const skData = skillData[id].skills[skill.id].data;
                if(skData.coinValue < 0) acc[skData.affinity] = Math.max(acc[skData.affinity], skData.baseValue);
                else acc[skData.affinity] = Math.max(acc[skData.affinity], skData.baseValue + skData.coinValue * skData.coins.length);
            });
        }

        if (mode === "all") {
            addToAcc();
        } else if (mode === "act") {
            const index = deploymentOrder.findIndex(x => x === i + 1);
            if (index === -1) return acc;
            addToAcc();
        }
        return acc;
    }, Object.fromEntries(affinities.map(x => [x, 0])));

    return <BuildDisplayMenuCard>
        <span>Max Event Rolls:</span>
        <DropdownButton
            value={mode ?? "all"}
            setValue={x => setMode(x)}
            options={{
                "all": "All Sinners",
                "act": "Active Sinners"
            }}
        />
        <div style={{ display: "flex", flexWrap: "wrap" }}>
            {affinities.map(affinity =>
                <div key={affinity} style={{ display: "grid", gridTemplateRows: "repeat(2, auto)", justifyItems: "center" }}>
                    <KeywordIcon id={affinity} />
                    <div style={{ fontWeight: "bold", "color": "#ddd" }}>
                        {values[affinity]}
                    </div>
                </div>)}
        </div>
    </BuildDisplayMenuCard>;
}
