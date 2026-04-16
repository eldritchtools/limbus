"use client";

import { isTouchDevice } from "@eldritchtools/shared-components";

import NoPrefetchLink from "../NoPrefetchLink";
import TooltipTemplate from "./TooltipTemplate";
import { useSkillData } from "../dataHooks/skills";
import { useData } from "../DataProvider";
import EgoIcon from "../icons/EgoIcon";
import Icon from "../icons/Icon";
import KeywordIcon from "../icons/KeywordIcon";
import Status from "../objects/Status";
import { AtkWeight } from "../skill/AtkWeight";

const TOOLTIP_ID = "ego-tooltip";

function EgoTooltipContent({ id, ego, uptie = 4 }) {
    const {awakeningSkills, corrosionSkills} = useSkillData("ego", id, uptie);
    const types = [];

    types.push(ego.awakeningType.affinity);
    if (ego.corrosionType && ego.awakeningType.affinity !== ego.corrosionType.affinity)
        types.push(ego.corrosionType.affinity);

    types.push(ego.awakeningType.type);
    if (ego.corrosionType && ego.awakeningType.type !== ego.corrosionType.type)
        types.push(ego.corrosionType.type);

    return <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "row", padding: "0.5rem", gap: "0.5rem", alignItems: "center" }}>
            <div><EgoIcon ego={ego} type={"awaken"} displayName={true} displayRarity={true} style={{ width: "128px", height: "128px" }} /></div>
            <div style={{ display: "flex", flexDirection: "column", width: "192px", minHeight: "128px" }}>
                {awakeningSkills.length > 0 ?
                    <div style={{ display: "flex", gap: "0.2rem", alignItems: "center", paddingLeft: "0.2rem", paddingBottom: "0.2rem" }}>
                        Atk #:
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                {awakeningSkills.map((skill, i) => <AtkWeight key={i} skillData={skill.data} />)}
                            </div>
                            {corrosionSkills.length > 0 ?
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    {corrosionSkills.map((skill, i) => <AtkWeight key={i} skillData={skill.data} />)}
                                </div> :
                                null
                            }
                        </div>
                    </div> :
                    null
                }
                <div style={{ flex: 1, display: "flex" }}>
                    {types.map(x => <KeywordIcon key={x} id={x} />)}
                </div>
                <div style={{ flex: 1, display: "flex", flexWrap: "wrap" }}>
                    {ego.statuses.sort().map(x => <Status key={x} id={x} includeTooltip={false} includeName={false} />)}
                </div>
                <div style={{ flex: 1, display: "flex", flexWrap: "wrap" }}>
                    {Object.entries(ego.cost).map(([affinity, cost]) => <div key={affinity} style={{ display: "flex", alignItems: "center" }}>
                        <KeywordIcon id={affinity} />
                        <span>x{cost}</span>
                    </div>)}
                </div>
            </div>
        </div>
        {isTouchDevice() ? <NoPrefetchLink href={`/egos/${ego.id}`} style={{ alignSelf: "center", fontSize: "1.2rem" }}>Go to page</NoPrefetchLink> : null}
    </div>
}

function TooltipLoader({ id, uptie }) {
    const [egos, egosLoading] = useData("egos");
    if (!id || egosLoading || !(id in egos)) return null;

    if (uptie) return <EgoTooltipContent id={id} ego={egos[id]} uptie={uptie} />
    return <EgoTooltipContent id={id} ego={egos[id]} />
}

export default function EgoTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID} contentFunc={content => {
        if (!content) return null;
        const parts = content.split("|");
        if (parts.length > 1) return <TooltipLoader id={parts[0]} uptie={Number(parts[1])} />
        else return <TooltipLoader id={content} />
    }} clickable={isTouchDevice()} />
}

export function getEgoTooltipProps(id) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": id
    }
}