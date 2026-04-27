export const affinityColorMapping = {
    "wrath": "#fe0000",
    "lust": "#fb6500",
    "sloth": "#f7c729",
    "gluttony": "#9dfe00",
    "gloom": "#0dc1eb",
    "pride": "#1a64f0",
    "envy": "#9300db",
    "none": "#aaa"
}

export const giftTagColors = {
    enhanceable: "#4ade80",
    ingredient: "#f97316",
    fusion: "#facc15",
    hardonly: "#f87171",
    eventreward: "#14b8a6",
    packexclusive: "#b45309",
    cursed: "#a78bfa",
    blessed: "#38bdf8",
    hidden: "#9ca3af"
}

export const deploymentColors = {
    none: "#444",
    active: "#fefe3d",
    backup: "#29fee9"
}

export const uiColors = {
    red: "rgba(255, 99, 71, 0.85)",
    green: "rgba(50, 205, 50, 0.85)"
    //green: "rgba(60, 179, 113, 0.85)"
}

export function ColoredResistance({ resist }) {
    if (resist < 1) {
        return <span style={{ color: "#888", fontWeight: "bold" }}>x{resist}</span>
    } else if (resist > 1) {
        return <span style={{ color: "#fe0000", fontWeight: "bold" }}>x{resist}</span>
    } else {
        return <span style={{ color: "#c8aa80", fontWeight: "bold" }}>x{resist}</span>
    }
}