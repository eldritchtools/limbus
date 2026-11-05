import { useMemo, useState } from "react";

import styles from "./idleSim.module.css";
import { isQuestAvailable, isQuestComplete, questRewardText } from "./quests";

export default function QuestBar({ idleSim }) {
    const [open, setOpen] = useState(false);
    const quests = useMemo(() => {
        const available = Object.keys(idleSim.data.quests).filter(id => isQuestAvailable(idleSim.data, idleSim.state, id));
        const ready = available.filter(id => isQuestComplete(idleSim.data, idleSim.state, id));
        return { ready, list: [...ready, ...available.filter(id => !ready.includes(id))] };
    }, [idleSim.data, idleSim.state]);

    if (quests.list.length === 0) return null;

    return <div style={{ position: "relative", width: "100%", maxWidth: "600px" }}>
        {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />}
        <div onClick={() => setOpen(o => !o)} className={styles.clickableTile} style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <span style={{ fontWeight: "bold" }}>Active Quests{quests.ready.length ? ` (${quests.ready.length} ready)` : ""}</span>
            <span>▼</span>
        </div>
        {open && <div className={styles.tile} style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "var(--bg-secondary)", alignItems: "stretch", gap: "0.4rem" }}>
            {quests.list.map(id => {
                const quest = idleSim.data.quests[id];
                const done = quests.ready.includes(id);
                return <div key={id} style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "bold" }}>{quest.name}</span> {!done}
                        <span style={{ fontSize: "0.8rem" }}>{quest.description}</span>
                        <span style={{ fontSize: "0.8rem" }}>Reward: {questRewardText(idleSim.data, quest.reward).join(", ")}</span>
                    </div>
                    <button disabled={!done} onClick={() => idleSim.claimQuest(id)}>Claim</button>
                </div>;
            })}
        </div>}
    </div>;
}