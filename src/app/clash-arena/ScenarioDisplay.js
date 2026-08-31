import StatusIcon from "../components/icons/StatusIcon";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";

export default function ScenarioDisplay({ round }) {
    return <div style={{ display: "grid", gridTemplateColumns: "auto auto auto", gap: "1rem" }}>
        <ScenarioSide label={"You"} side={round.self} />
        <span style={{ alignSelf: "center", fontSize: "2rem", fontWeight: "bold" }}> - </span>
        <ScenarioSide label={"Enemy"} side={round.target} />
    </div>
}

function ScenarioSide({ label, side }) {
    const t = side.sp / 45;

    const orbHue = t < 0
        ? 0
        : 210;

    const orbSaturation = Math.abs(t) * 90;

    return <div style={{
        flex: 1, width: "200px", border: "1px var(--primary-border-color) solid", borderRadius: "1rem", padding: "0.5rem",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", position: "relative"
    }}>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {label}
        </span>

        <div style={{
            position: "absolute", right: "4px", top: "4px",
            width: "1.25rem", height: "1.25rem", borderRadius: "50%", 
            background: "var(--bg-hover)", textAlign: "center"
        }}
            {...getGeneralTooltipProps("HP and Speed values are simulated for use in some Identities' conditionals and are otherwise unused. SP functions the same way as in-game, affecting coin flip probabilities.")}
        >
            ?
        </div>

        <div style={{ display: "flex", gap: "0.5rem", width: "100%", alignItems: "center" }}>
            <div style={{
                width: "100%", maxWidth: 180, height: 12,
                borderRadius: 6, border: "2px var(--primary-border-color) solid",
                overflow: "hidden", background: "transparent"
            }}>
                <div style={{ width: `${side.hp}%`, height: "100%", background: "#d65a32" }} />
            </div>
            <span>{side.hp}%</span>
        </div>

        <div style={{ display: "flex", gap: "1rem", width: "100%", justifyContent: "center", alignItems: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
            <div>
                SPD: <span style={{ color: getSpeedColor(side.speed), textShadow: side.speed >= 7 ? "0 0 8px rgba(255, 200, 50, 0.5)" : undefined }}>{side.speed}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                SP:
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `hsl(${orbHue}, ${orbSaturation}%, 35%)`,
                    // boxShadow: `0 0 12px hsl(${orbHue}, ${orbSaturation}%, 45%)`
                }}>
                    {side.sp}
                </div>
            </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", minHeight: 42 }}>
            {Object.entries(side.statuses).map(([status, values]) => (
                <div key={status} style={{ position: "relative", width: 42, height: 42 }}>
                    <StatusIcon id={status} style={{ width: "38px", height: "38px" }} />

                    <span style={{
                        position: "absolute", bottom: -3, left: -2, lineHeight: 1,
                        fontSize: 18, fontWeight: "bold", color: "#ddd", textShadow: "0 1px 3px black"
                    }}>
                        {values.potency}
                    </span>

                    <span style={{
                        position: "absolute", bottom: -3, right: -2, lineHeight: 1,
                        fontSize: 18, fontWeight: "bold", color: "#ddd", textShadow: "0 1px 3px black"
                    }}>
                        {values.count}
                    </span>

                </div>
            ))}
        </div>
    </div>
}

function getSpeedColor(speed) {
    const t = (speed - 1) / 9;

    // grey -> gold
    const r = Math.round(130 + t * 125);
    const g = Math.round(130 + t * 80);
    const b = Math.round(130 - t * 100);

    return `rgb(${r}, ${g}, ${b})`;
}
