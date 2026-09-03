import { useMemo, useState } from "react";

import IdentityIcon from "../components/icons/IdentityIcon";
import DragContainer from "../components/objects/DragContainer";

export default function PointsDisplay({ clashBattle }) {
    const identitiesByCost = useMemo(() => {
        const groups =
            Object.entries(clashBattle.clashingData).reduce((acc, [id, data]) => {
                const points = data.points;
                if (!acc[points]) acc[points] = [];
                acc[points].push(id);
                return acc;
            }, {});

        return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
    }, [clashBattle]);

    const [expanded, setExpanded] = useState(false);

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "1200px" }}>
        <button onClick={() => setExpanded(!expanded)} style={{ alignSelf: "center" }}>
            {expanded ? "Hide" : "Show"} Identity Point Costs
        </button>

        {expanded &&
            <span className="sub-text" style={{ textAlign: "center" }}>
                Point values are assigned based on a rough estimate of the identity&apos;s average clash values using the currently implemented values and conditionals. Identities with unimplemented mechanics may cost lower than initially expected. Point values will be adjusted whenever new identities or mechanics are implemented.
            </span>
        }

        {expanded &&
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {identitiesByCost.map(([points, identities]) => (
                    <div key={points}>
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                            {points} {Number(points) === 1 ? "Point" : "Points"} ({identities.length} identities)
                        </div>

                        <DragContainer style={{ maxWidth: "100%" }}>
                            <div style={{ display: "flex", width: "max-content" }}>
                                {identities.map(id =>
                                    <IdentityIcon key={id} id={id} displayName={true} size={92} style={{ pointerEvents: "none" }} />
                                )}
                            </div>
                        </DragContainer>
                    </div>
                ))}
            </div>
        }
    </div>;
}