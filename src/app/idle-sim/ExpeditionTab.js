/* eslint-disable @next/next/no-img-element */
import { ASSETS_ROOT } from "../paths";
import styles from "./idleSim.module.css";

const overlayTextStyle = {
    position: "absolute", display: "block", color: "#ddd",
    textShadow: "0 0 4px #000, 0 0 12px #000, 2px 2px 4px #000, -2px -2px 4px #000"
};

function ExpeditionTileBase({ expeditionData, children }) {
    return <div className={styles.tile} style={{ position: "relative", aspectRatio: "2 / 1" }}>
        <img src={`${ASSETS_ROOT}/backgrounds/${expeditionData.src}.webp`} alt={""} title={""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <span style={{ ...overlayTextStyle, left: "4px", top: "4px", fontSize: "1.2rem", fontWeight: "bold", maxWidth: "70%" }}>{expeditionData.name}</span>
        {children}
    </div>
}

function ExpeditionTileDispatch({ idleSim, expeditionId }) {
    const data = idleSim.data.expeditions[expeditionId];

    return <ExpeditionTileBase expeditionData={data}>
    </ExpeditionTileBase>
}

function ExpeditionTileOngoing({ idleSim, expedition }) {
    const data = idleSim.data.expeditions[expedition.expedition_id];

    if (expedition.result)
        return <ExpeditionTileBase expeditionData={data}>
        </ExpeditionTileBase>

    return <ExpeditionTileBase expeditionData={data}>
    </ExpeditionTileBase>
}

function ExpeditionTileEvent({ idleSim, event }) {
    const data = idleSim.data.expeditions[event.expedition_id];

    if (event.result)
        return <ExpeditionTileBase expeditionData={data}>
        </ExpeditionTileBase>

    return <ExpeditionTileBase expeditionData={data}>
        <span style={{ ...overlayTextStyle, left: "4px", top: "20%", maxWidth: "60%", maxHeight: "70%", }}></span>
    </ExpeditionTileBase>
}

export default function ExpeditionTab({ idleSim }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "0.2rem" }}>
        {idleSim.state.pending_events.length > 0 && <>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "0.3rem" }}>Pending Events</span>
            {idleSim.state.pending_events.map(event => <ExpeditionTileEvent key={event.id} event={event} />)}
        </>}
        {idleSim.state.finished_expeditions.length > 0 && <>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "0.3rem" }}>Finished Expeditions</span>
            {idleSim.state.finished_expeditions.map(expedition => <ExpeditionTileOngoing key={expedition.id} expedition={expedition} />)}
        </>}
        {idleSim.state.expeditions.length > 0 && <>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "0.3rem" }}>Ongoing Expeditions</span>
            {idleSim.state.expeditions.map(expedition => <ExpeditionTileOngoing key={expedition.id} expedition={expedition} />)}
        </>}
    </div>;
}