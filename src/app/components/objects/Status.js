import styles from "./Status.module.css";
import DataLoader from "../DataLoader";
import StatusIcon from "../icons/StatusIcon";
import ProcessedText from "../texts/ProcessedText";
import { getStatusTooltipProps } from "../tooltips/TooltipProps";

const statusTypeColorMapping = {
    "Positive": "yellow",
    "Negative": "red",
    "Neutral": "darkgoldenrod",
}

function StatusMain({ id, status, includeTooltip = true, includeName = true, iconStyleOverride = {}, nameStyleOverride = {} }) {
    const nameStyle = {};
    if (status.buffType in statusTypeColorMapping) nameStyle.color = statusTypeColorMapping[status.buffType];
    const tooltipProps = includeTooltip ? getStatusTooltipProps(id) : {};

    return <span className={styles.statusContainer} {...tooltipProps}>
        <StatusIcon className={styles.statusIcon} id={id} status={status} style={iconStyleOverride} />
        {includeName ?
            <span className={styles.statusName} style={{ ...nameStyle, ...nameStyleOverride }}>
                <ProcessedText text={status.name} allowReplacement={false} />
            </span> :
            null
        }
    </span>
}

export default function Status({ id, status = null, ...props }) {
    if (status) {
        return <StatusMain id={id ?? status?.id} status={status} {...props} />
    } else {
        return <DataLoader file="statuses" type="status" id={id}>
            {status => <StatusMain id={id} status={status} {...props} />}
        </DataLoader>
    }
}
