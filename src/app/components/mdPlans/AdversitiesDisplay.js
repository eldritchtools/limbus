"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";

import styles from "./AdversitiesDisplay.module.css";
import { useData } from "../DataProvider";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

export function AdversitiesPointTotal({ adversities }) {
    const [mdData, mdDataLoading] = useData("md/details");

    if (mdDataLoading) return null;

    const isAdversityActive = (f, i) => (adversities[f] & (1 << i)) !== 0;

    return Object.entries(mdData.adversity).reduce((acc, [f, list]) =>
        list.reduce((acc2, adv, i) => isAdversityActive(f, i) ? acc2 + adv.value : acc2, acc),
        0);
}

export default function AdversitiesDisplay({ adversities, setAdversities, editable = false }) {
    const [mdData, mdDataLoading] = useData("md/details");
    const { isMobile } = useBreakpoint();

    if (mdDataLoading) return null;

    const setAllAdversities = () => {
        setAdversities(Object.entries(mdData.adversity).reduce((acc, [f, list]) => {
            acc[f] = (1 << list.length) - 1; return acc;
        }, {}));
    }

    const unsetAllAdversities = () => {
        setAdversities(Object.entries(mdData.adversity).reduce((acc, [f]) => {
            acc[f] = 0; return acc;
        }, {}));
    }

    const toggleAdversity = (f, i) => {
        setAdversities(p => ({ ...p, [f]: p[f] ^ (1 << i) }));
    }

    const isAdversityActive = (f, i) => (adversities[f] & (1 << i)) !== 0;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {editable ? <div style={{ display: "flex", gap: "0.2rem" }}>
            <button onClick={setAllAdversities}>Set all</button>
            <button onClick={unsetAllAdversities}>Unset all</button>
        </div> : null}
        {Object.entries(mdData.adversity).map(([f, list]) =>
            <div key={f} style={{ display: "flex" }}>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", padding: "0.25rem", border: "1px #aaa solid", borderRadius: "0.5rem", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>F{f}</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                        {list.map((adv, i) =>
                            <div key={adv.name}
                                className={`${styles.adversity} ${editable ? styles.editable : null} ${isAdversityActive(f, i) ? styles.active : styles.inactive}`}
                                {...getGeneralTooltipProps(adv.desc)}
                                onClick={editable ? () => toggleAdversity(f, i) : null}
                            >
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "10px" }}>{adv.value}</span>
                                <div style={{ height: "100%", border: "1px #777 solid" }} />
                                <span>{adv.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
}
