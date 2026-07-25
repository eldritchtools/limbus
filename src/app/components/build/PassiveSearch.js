"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useMemo, useState } from "react";

import styles from "./PassiveSearch.module.css";
import { useData } from "../DataProvider";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";
import PassiveCard from "../skill/PassiveCard";

import { romanMapping } from "@/app/lib/constants";
import { paragraphScore } from "@/app/lib/scoring";
import { replaceStatusesInString } from "@/app/lib/statusReplacement";
import useLocalState from "@/app/lib/useLocalState";


export default function PassiveSearch({ setIdentityId, setEgoId }) {
    const [passives, passivesLoading] = useData("passives");
    const [statuses, statusesLoading] = useData("statuses");
    const [skillTags, skillTagsLoading] = useData("skill_tags");

    const [mode, setMode] = useLocalState("buildPassiveSearch", "both");
    const [searchString, setSearchString] = useState("");
    const { isMobile } = useBreakpoint();

    const result = useMemo(() => {
        if (passivesLoading || statusesLoading || skillTagsLoading) return [];

        const searching = searchString.trim().length !== 0;
        const valid = [];

        if (mode === "both" || mode === "id") {
            Object.entries(passives.support).forEach(([id, list]) => {
                list.forEach(({ uptie, passives }) => {
                    if (searching) {
                        const score = paragraphScore(searchString, replaceStatusesInString(passives[0].desc, statuses, skillTags));
                        if(score > 0) valid.push([id, uptie, score]);
                    } else {
                        valid.push([id, uptie, 0]);
                    }
                })
            })
        }

        if (mode === "both" || mode === "ego") {
            Object.entries(passives.ego).forEach(([id, list]) => {
                const passive = list[list.length - 1]
                if (searching) {
                    const score = paragraphScore(searchString, replaceStatusesInString(passive.desc, statuses, skillTags));
                    if(score > 0) valid.push([id, null, score]);
                } else {
                    valid.push([id, null, 0]);
                }
            })
        }

        return valid
            .sort(([, , as], [, , bs]) => bs - as)
            .map(([id, uptie]) => {
                if (id[0] === '1') {
                    const passive = passives.support[id].find(x => x.uptie === uptie);
                    return <div key={`${id}-${uptie}`} className={styles.card} onClick={() => setIdentityId(id)}>
                        <div style={{ textAlign: "center" }}>
                            <IdentityIcon id={id} uptie={uptie} displayName={true} displayRarity={true} displayUptie={true} size={isMobile ? 72 : 128} />
                            Uptie: {romanMapping[uptie]}
                        </div>
                        <PassiveCard passive={passive.passives[0]} noBorder={true} />
                    </div>
                } else if (id[0] === '2') {
                    const passiveList = passives.ego[id];
                    const passive = passiveList[passiveList.length - 1];
                    return <div key={id} className={styles.card} onClick={() => setEgoId(id)}>
                        <EgoIcon id={id} type={"awaken"} displayName={true} displayRarity={true} size={isMobile ? 72 : 128} />
                        <PassiveCard passive={passive} noBorder={true} />
                    </div>
                } else {
                    return null;
                }
            })
    }, [passives, passivesLoading, mode, searchString, setIdentityId, setEgoId, isMobile, statuses, statusesLoading, skillTags, skillTagsLoading]);

    return <div className="panel-container" style={{ gap: "0.5rem", width: "100%" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", paddingLeft: "1rem" }}>
            <div className={`tab-header ${mode === "both" ? "active" : ""}`} onClick={() => setMode("both")}>Both</div>
            <div className={`tab-header ${mode === "id" ? "active" : ""}`} onClick={() => setMode("id")}>Identities</div>
            <div className={`tab-header ${mode === "ego" ? "active" : ""}`} onClick={() => setMode("ego")}>E.G.Os</div>
            <input value={searchString} onChange={e => setSearchString(e.target.value)} placeholder="Search..." />
        </div>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                {result}
            </div>
        </div>
    </div>
}
