import { EGO_TOOLTIP_ID } from "./EgoTooltip";
import { GENERAL_TOOLTIP_ID } from "./GeneralTooltip";
import { IDENTITY_TOOLTIP_ID } from "./IdentityTooltip";
import { STATUS_TOOLTIP_ID } from "./StatusTooltip";

export function getEgoTooltipProps(id, forceRatings) {
    return {
        "data-tooltip-id": EGO_TOOLTIP_ID,
        "data-tooltip-content": forceRatings ? `${id}|${forceRatings}` : id,
    }
}

export function getGeneralTooltipProps(content) {
    return {
        "data-tooltip-id": GENERAL_TOOLTIP_ID,
        "data-tooltip-content": content
    }
}

export function getIdentityTooltipProps(id, forceRatings) {
    return {
        "data-tooltip-id": IDENTITY_TOOLTIP_ID,
        "data-tooltip-content": forceRatings ? `${id}|${forceRatings}` : id,
    }
}

export function getStatusTooltipProps(id) {
    return {
        "data-tooltip-id": STATUS_TOOLTIP_ID,
        "data-tooltip-content": id
    }
}