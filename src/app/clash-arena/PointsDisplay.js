import { useMemo, useState } from "react";

import EgoIcon from "../components/icons/EgoIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import DragContainer from "../components/objects/DragContainer";

export default function PointsDisplay({ clashBattle }) {
    const [identitiesByCost, egoByCost] = useMemo(() => {
        const [idGroups, egoGroups] =
            Object.entries(clashBattle.clashingData).reduce(([idAcc, egoAcc], [id, data]) => {
                const points = data.points;
                if (data.type === "id") {
                    if (!idAcc[points]) idAcc[points] = [];
                    idAcc[points].push(id);
                } else if (data.type === "ego") {
                    if (!egoAcc[points]) egoAcc[points] = [];
                    egoAcc[points].push(id);
                }
                return [idAcc, egoAcc];
            }, [{}, {}]);

        return [
            Object.entries(idGroups).sort(([a], [b]) => Number(b) - Number(a)),
            Object.entries(egoGroups).sort(([a], [b]) => Number(b) - Number(a))
        ];
    }, [clashBattle]);

    const [expanded, setExpanded] = useState(false);

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "1200px" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={() => setExpanded(expanded === "id" ? false : "id")} style={{ alignSelf: "center" }}>
                {expanded === "id" ? "Hide" : "Show"} Identity Point Costs
            </button>
            <button onClick={() => setExpanded(expanded === "ego" ? false : "ego")} style={{ alignSelf: "center" }}>
                {expanded === "ego" ? "Hide" : "Show"} E.G.O Point Costs
            </button>
        </div>

        {expanded &&
            <span className="sub-text" style={{ textAlign: "center" }}>
                Point values are assigned based on a rough estimate of the {expanded === "id" ? "Identity's" : "E.G.O's"} average clash values using the currently implemented values and conditionals. {expanded === "id" ? "Identities" : "E.G.O"} with unimplemented mechanics may cost lower than initially expected. Point values will be adjusted whenever new {expanded === "id" ? "Identities" : "E.G.O"} or mechanics are implemented.
            </span>
        }

        {expanded &&
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(expanded === "id" ? identitiesByCost : egoByCost).map(([points, items]) => (
                    <div key={points}>
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                            {points} {Number(points) === 1 ? "Point" : "Points"} ({items.length} {expanded === "id" ? "Identities" : "E.G.O"})
                        </div>

                        <DragContainer style={{ maxWidth: "100%" }}>
                            <div style={{ display: "flex", width: "max-content" }}>
                                {items.map(id =>
                                    expanded === "id" ?
                                        <IdentityIcon key={id} id={id} displayName={true} size={92} style={{ pointerEvents: "none" }} /> :
                                        <EgoIcon key={id} id={id} type="awaken" displayName={true} size={92} style={{ pointerEvents: "none" }} />
                                )}
                            </div>
                        </DragContainer>
                    </div>
                ))}
            </div>
        }
    </div>;
}