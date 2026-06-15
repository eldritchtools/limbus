import { affinityColorMapping, affinityColorMappingAlt } from "@/app/lib/colors";

export default function NamePill({ name, affinity = "none" }) {
    const color = affinityColorMapping[affinity];
    const color2 = affinityColorMappingAlt[affinity];

    return <div style={{
        position: "relative", padding: "0.3rem", color: "#ddd",
        textShadow: "black 2px 2px 2px", fontWeight: "bold", marginRight: "-2.35rem",
        textAlign: "start"
    }}>
        <div
            style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `
                    linear-gradient(290deg, ${color2} 2.5rem, 
                        ${color} 2.5rem, ${color} 2.65rem, ${color2} 2.65rem, ${color2} 2.8rem, 
                        ${color} 2.8rem, ${color} 2.95rem, ${color2} 2.95rem, ${color2} 3.1rem, 
                        ${color} 3.1rem, ${color} 3.25rem, ${color2} 3.25rem, ${color2} 3.4rem, 
                        ${color} 3.4rem)
                    `,
                clipPath: "polygon(0 0, calc(100% - 1rem) 0, 100% 100%, 0 100%)",
                zIndex: 0,
            }}
        />

        <span
            style={{
                position: "relative",
                zIndex: 1,
                marginRight: "2.5rem"
            }}
        >
            {name}
        </span>
    </div>
}