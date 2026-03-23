import { useData } from "../DataProvider";
import Icon from "../icons/Icon";
import DropdownButton from "../objects/DropdownButton";

import useLocalState from "@/app/lib/useLocalState";

const affinities = ["wrath", "lust", "sloth", "gluttony", "gloom", "pride", "envy"];

export default function SinDistribution({ identityIds, deploymentOrder, activeSinners, alignment = "center" }) {
    const [mode, setMode] = useLocalState("buildSinDistributionType", "all-a");
    const [identities, identitiesLoading] = useData("identities");

    if (identitiesLoading) return null;

    const values = identityIds.reduce((acc, id, i) => {
        if (!id) return acc;
        const identity = identities[id];

        const [modeType, modeSkill] = (mode ?? "all-a").split("-");

        const addToAcc = () => {
            if (modeSkill === "a") {
                identity.skillTypes.forEach(skill => {
                    if (!skill.num) return;
                    acc[skill.type.affinity] += skill.num;
                });
            } else {
                acc[identity.defenseSkillTypes[0].type.affinity] += 1;
            }
        }

        if (modeType === "all") {
            addToAcc();
        } else {
            const index = deploymentOrder.findIndex(x => x === i + 1);
            if (index === -1) return acc;
            if (modeType === "dep" || (modeType === "act" && index < activeSinners)) addToAcc();
        }
        return acc;
    }, Object.fromEntries(affinities.map(x => [x, 0])));

    return <div style={{ display: "flex", flexDirection: "column", width: "300px", alignItems: alignment, border: "1px #777 solid", borderRadius: "1rem" }}>
        <span>Sin Distribution:</span>
        <DropdownButton
            value={mode ?? "all-a"}
            setValue={x => setMode(x)}
            options={{
                "all-a": "All Sinners",
                "act-a": "Active Sinners",
                "dep-a": "Deployed Sinners",
                "all-d": "All Sinners (defense)",
                "act-d": "Active Sinners (defense)",
                "dep-d": "Deployed Sinners (defense)"
            }}
        />
        <div style={{ display: "flex", flexWrap: "wrap" }}>
            {affinities.map(affinity =>
                <div key={affinity} style={{ display: "grid", gridTemplateRows: "repeat(2, auto)", justifyItems: "center" }}>
                    <Icon path={affinity} style={{ height: "32px", width: "32px" }} />
                    <div style={{ fontWeight: "bold", "color": values[affinity] ? "#ddd" : "#aaa" }}>
                        {values[affinity]}
                    </div>
                </div>)}
        </div>
    </div>;
}
