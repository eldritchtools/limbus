import StatusIcon from "../components/icons/StatusIcon";

export default function StatusDisplay({ id, potency, count }) {
    return <div style={{ position: "relative", width: 42, height: 42 }}>
        <StatusIcon id={id} style={{ width: "38px", height: "38px" }} />

        {potency !== null &&
            <span style={{
                position: "absolute", bottom: -3, left: -2, lineHeight: 1,
                fontSize: 18, fontWeight: "bold", color: "#ddd", textShadow: "0 1px 3px black"
            }}>
                {potency}
            </span>
        }

        {count !== null &&
            <span style={{
                position: "absolute", bottom: -3, right: -2, lineHeight: 1,
                fontSize: 18, fontWeight: "bold", color: "#ddd", textShadow: "0 1px 3px black"
            }}>
                {count}
            </span>
        }

    </div>
}