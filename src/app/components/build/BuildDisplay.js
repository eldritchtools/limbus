"use client";

import { useMemo, useState } from "react";

import styles from "./BuildDisplay.module.css";
import BuildDisplayCalcMenu from "./BuildDisplayCalcMenu";
import BuildDisplaySinnerContainer from "./BuildDisplaySinnerContainer";
import { useEgosWithUpcoming, useIdentitiesWithUpcoming } from "../dataHooks/upcoming";
import { useData } from "../DataProvider";
import MarkdownRenderer from "../markdown/MarkdownRenderer";

export default function BuildDisplay({ identityIds, egoIds, identityUpties, identityLevels, egoThreadspins, sinnerNotes, deploymentOrder, activeSinners, displayType }) {
    const [identities, identitiesLoading] = useIdentitiesWithUpcoming();
    const [egos, egosLoading] = useEgosWithUpcoming();
    const [upcoming, upcomingLoading] = useData("upcoming");

    // Convert empty strings (if editing) to nulls
    const upties = useMemo(() => identityUpties ? identityUpties.map(x => x === "" ? null : x) : null, [identityUpties]);
    const levels = useMemo(() => identityLevels ? identityLevels.map(x => x === "" ? null : x) : null, [identityLevels]);
    const threadspins = useMemo(() => egoThreadspins ? egoThreadspins.map(x => x.map(y => y === "" ? null : y)) : null, [egoThreadspins]);
    const notes = useMemo(() => sinnerNotes ? sinnerNotes.map(x => x === "" ? null : x) : null, [sinnerNotes]);

    const [otherOpts, setOtherOpts] = useState({});

    if (identitiesLoading || egosLoading) return null;

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
        {displayType === "calc" ?
            <BuildDisplayCalcMenu opts={otherOpts} setOpts={setOtherOpts} /> :
            null
        }

        <div className={styles.buildDisplay} style={{ alignSelf: "center", transform: "translateZ(0)" }}>
            {Array.from({ length: 12 }, (_, index) =>
                <div key={index} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <BuildDisplaySinnerContainer
                        displayType={displayType}
                        sinnerId={index + 1}
                        identity={identities[identityIds[index]] || null}
                        egos={egoIds?.[index]?.map(id => egos[id] || null) || null}
                        identityUptie={upties ? upties[index] : null}
                        identityLevel={levels ? levels[index] : null}
                        egoThreadspins={threadspins ? threadspins[index] : null}
                        deploymentOrder={deploymentOrder}
                        activeSinners={activeSinners}
                        otherOpts={otherOpts}
                    />
                    {notes && notes[index] ? <MarkdownRenderer content={notes[index]} /> : null}
                </div>
            )}
        </div>
    </div>
}
