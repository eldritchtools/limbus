"use client";

import styles from "./Tooltip.module.css";
import TooltipTemplate from "./TooltipTemplate";
import MarkdownRenderer from "../markdown/MarkdownRenderer";

export const GENERAL_MARKDOWN_TOOLTIP_ID = "general-markdown-tooltip";

function GeneralMarkdownTooltipContent({ content }) {
    return <div className={styles.generalTooltip}>
        <MarkdownRenderer content={content} />
    </div>
}

export default function GeneralMarkdownTooltip() {
    return <TooltipTemplate id={GENERAL_MARKDOWN_TOOLTIP_ID} contentFunc={content => <GeneralMarkdownTooltipContent content={content} />} />
}

export function getGeneralMarkdownTooltipProps(content) {
    return {
        "data-tooltip-id": GENERAL_MARKDOWN_TOOLTIP_ID,
        "data-tooltip-content": content
    }
}