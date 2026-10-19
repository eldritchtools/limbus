"use client";

import { Tooltip } from "react-tooltip";

export const tooltipStyle = {
    outlineStyle: "solid",
    outlineColor: "var(--primary-border-color)",
    outlineWidth: "1px",
    backgroundColor: "var(--bg-secondary)",
    borderRadius: "1rem",
    zIndex: "9999",
    maxWidth: "min(90vw, 800px)",
    color: "var(--primary-text-color)"
};

export default function TooltipTemplate({ ref, id, contentFunc, clickable, isOpen, place, imperativeModeOnly }) {
    return <Tooltip
        ref={ref}
        id={id}
        render={({ content }) => <div style={tooltipStyle}>{contentFunc(content)}</div>}
        getTooltipContainer={() => document.body}
        style={{ backgroundColor: "transparent", zIndex: "9999" }}
        clickable={clickable}
        isOpen={isOpen} place={place} imperativeModeOnly={imperativeModeOnly}
    />
}