"use client";

import { Tooltip } from "react-tooltip";

const style = {
    outlineStyle: "solid",
    outlineColor: "var(--primary-border-color)",
    outlineWidth: "1px",
    backgroundColor: "var(--bg-secondary)",
    borderRadius: "1rem",
    zIndex: "9999",
    maxWidth: "min(90vw, 800px)",
    color: "var(--primary-text-color)"
};

export default function TooltipTemplate({ id, contentFunc, clickable }) {
    return <Tooltip
        id={id}
        render={({ content }) => <div style={style}>{contentFunc(content)}</div>}
        getTooltipContainer={() => document.body}
        style={{ backgroundColor: "transparent", zIndex: "9999" }}
        clickable={clickable}
    />
}