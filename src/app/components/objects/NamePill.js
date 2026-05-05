import { affinityColorMapping } from "@/app/lib/colors";

export default function NamePill({ name, affinity = "none" }) {
    return <div style={{
        borderRadius: "5px", backgroundColor: affinityColorMapping[affinity],
        padding: "5px", color: "#ddd", textShadow: "black 1px 1px 5px", fontWeight: "bold"
    }}
    >
        {name}
    </div>
}