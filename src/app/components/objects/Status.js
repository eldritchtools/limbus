import StatusIcon from "../icons/StatusIcon";
import { getStatusTooltipProps } from "../tooltips/StatusTooltip";

const iconStyle = { display: "inline-block", width: "1.5rem", height: "1.5rem", marginLeft: "-1px", marginRight: "2px", verticalAlign: "middle", transform: "translateY(-0.1rem)" };

const statusTypeColorMapping = {
    "Positive": "yellow",
    "Negative": "red",
    "Neutral": "darkgoldenrod",
}

function StatusMain({ id, status, includeTooltip = true, includeName = true, iconStyleOverride = {}, nameStyleOverride = {} }) {
    const nameStyle = { display: "inline", fontSize: "1rem", ...nameStyleOverride };
    if (status.buffType in statusTypeColorMapping) nameStyle.color = statusTypeColorMapping[status.buffType];
    const tooltipProps = includeTooltip ? getStatusTooltipProps(id) : {};

    return <span style={{ display: "inline" }} role="button" tabIndex={0} {...tooltipProps}>
        <StatusIcon id={id} status={status} style={{ ...iconStyle, ...iconStyleOverride }} />
        {includeName ? <span style={{ ...nameStyle, ...nameStyleOverride }}>{status.name}</span> : null}
    </span>
}

function StatusLoader({ id, includeTooltip, includeName, iconStyleOverride, nameStyleOverride }) {
    const [statuses, statusesLoading] = useData("statuses");

    if (statusesLoading) {
        return null;
    } else if (!(id in statuses)) {
        console.warn(`Status ${id} not found.`);
        return <span>Unknown Status: {id}</span>;
    } else {
        return <StatusMain id={id} status={statuses[id]}
            includeTooltip={includeTooltip} includeName={includeName}
            iconStyleOverride={iconStyleOverride} nameStyleOverride={nameStyleOverride}
        />
    }
}

export default function Status({ id, status = null, includeTooltip = true, includeName = true, iconStyleOverride = {}, nameStyleOverride = {} }) {
    if (status) {
        return <StatusMain
            id={id ?? status?.id} status={status}
            includeTooltip={includeTooltip} includeName={includeName}
            iconStyleOverride={iconStyleOverride} nameStyleOverride={nameStyleOverride}
        />
    } else {
        return <StatusLoader
            id={id}
            includeTooltip={includeTooltip} includeName={includeName}
            iconStyleOverride={iconStyleOverride} nameStyleOverride={nameStyleOverride}
        />
    }
}
