import { GENERAL_TOOLTIP_ID } from "./GeneralTooltip";
import { STATUS_TOOLTIP_ID } from "./StatusTooltip";

export function getGeneralTooltipProps(content) {
    return {
        "data-tooltip-id": GENERAL_TOOLTIP_ID,
        "data-tooltip-content": content
    }
}

export function getStatusTooltipProps(id) {
    return {
        "data-tooltip-id": STATUS_TOOLTIP_ID,
        "data-tooltip-content": id
    }
}