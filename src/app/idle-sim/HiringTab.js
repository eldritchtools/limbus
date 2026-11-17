import { useState } from "react";

import { StatTable } from "./components";
import { CATCHUP_LEVEL_GAP, HP_PER_LEVEL, START_HP, START_WE, WE_PER_LEVEL } from "./constants";
import { getAgentHireCost, getMaxStartLevel, getRerollCost } from "./hiring";
import styles from "./idleSim.module.css";
import { toCurrencyStr } from "./util";
import NumberInputWithButtons from "../components/objects/NumberInputWithButtons";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";

export default function HiringTab({ idleSim }) {
    const hiring = idleSim.state.hiring;
    const [level, setLevel] = useState(1);
    const max = getMaxStartLevel(idleSim.state);

    if (hiring) {
        const rerollCost = getRerollCost(idleSim.state, hiring.start_level);
        return <>
            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <span>Choose an agent:</span>
                <button
                    style={{ display: "flex", flexDirection: "column", textAlign: "center" }}
                    onClick={() => idleSim.rerollCandidates()}
                    disabled={idleSim.state.currency < rerollCost}
                >
                    <span>Reroll Candidates</span>
                    <span>{toCurrencyStr(rerollCost)}</span>
                </button>
            </div>
            {hiring.candidates.map((candidate, i) =>
                <div key={i} className={styles.clickableTile} style={{ gap: "0.5rem" }}
                    onClick={() => { idleSim.chooseCandidate(i); idleSim.updateUiState({ tab: "agents", agent: idleSim.state.next_agent_id }) }}
                >
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <span>Level: {hiring.start_level}</span>
                        <span>Max HP: {START_HP + (hiring.start_level - 1) * HP_PER_LEVEL}</span>
                        <span>WE: {START_WE + (hiring.start_level - 1) * WE_PER_LEVEL}</span>
                    </div>
                    <StatTable data={candidate} />
                </div>
            )}
        </>
    }

    const cost = getAgentHireCost(idleSim.state, level);

    return <>
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <span className="hover-text"
                {...getGeneralTooltipProps(`You can hire agents up to ${CATCHUP_LEVEL_GAP} levels below your highest leveled agent. Higher leveled agents cost more to hire.`)}
            >
                Starting Level (max {max})
            </span>
        </div>
        <NumberInputWithButtons min={1} max={max} value={level} setValue={setLevel} style={{ width: "3ch" }} />
        <span>Cost: {toCurrencyStr(cost)}</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => idleSim.startHiring(level)} disabled={idleSim.state.currency < cost}>Hire Agent</button>
        </div>
    </>
}
