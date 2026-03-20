import { useData } from "../DataProvider";
import StatusIcon from "../icons/StatusIcon";
import TooltipTemplate from "./TooltipTemplate";

const iconStyle = { display: "inline-block", width: "1.5rem", height: "1.5rem", marginRight: "4px" };
const descStyle = { display: "inline-block", fontSize: "1rem", lineHeight: "1.5", maxWidth: "75rem", textWrap: "wrap", whiteSpace: "pre-wrap", textAlign: "start" };
const TOOLTIP_ID = "status-tooltip";

function StatusTooltipContent({ status }) {
    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", fontSize: "1rem", fontWeight: "bold" }}>
            <StatusIcon status={status} style={iconStyle} />
            <span>{status.name}</span>
        </div>
        <div style={descStyle}>
            <span>{status.desc}</span>
        </div>
    </div>;
}

function TooltipLoader({ statusId }) {
    const [statuses, statusesLoading] = useData("statuses");
    if (!statusId || statusesLoading) return null;

    return <StatusTooltipContent status={statuses[statusId]} />
}

export default function StatusTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID} contentFunc={id => <TooltipLoader statusId={id} />} />
}

export function getStatusTooltipProps(id) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": id
    }
}