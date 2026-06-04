"use client";

import DeploymentPositionOverlay from "./DeploymentPositionOverlay";
import IdentityIcon from "../icons/IdentityIcon";
import SinnerIcon from "../icons/SinnerIcon";

export default function BuildIdentitiesGrid({ identityIds, scale, deploymentOrder = [], activeSinners = 0, identityUpties = null, identityStyles, iconSwaps }) {
    const size = scale * 256;
    return <div style={{
        display: "grid", gridTemplateColumns: `repeat(6, ${size}px)`, gridTemplateRows: `repeat(2, ${size}px)`,
        width: `${size * 6 + 10}px`, alignItems: "center", justifyItems: "center", gap: "2px"
    }}>
        {identityIds.map((id, i) =>
            <div key={i} style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {id ?
                    <IdentityIcon
                        key={i} id={id} scale={scale} uptie={identityUpties?.[i] ?? undefined} swapIcon={iconSwaps?.includes(i + 1)}
                        style={{ borderRadius: "4px", ...(identityStyles ? identityStyles[i] : {}) }} /> :
                    <SinnerIcon
                        key={i} num={i + 1}
                        style={{ width: `${size * .75}px`, height: `${size * .75}px`, ...(identityStyles ? identityStyles[i] : {}) }}
                    />
                }

                <DeploymentPositionOverlay sinnerId={i + 1} deploymentOrder={deploymentOrder} activeSinners={activeSinners} />
            </div>
        )}
    </div>
}
