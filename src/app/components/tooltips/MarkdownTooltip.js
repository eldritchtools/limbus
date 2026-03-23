import { isTouchDevice } from "@eldritchtools/shared-components";

import TooltipTemplate from "./TooltipTemplate";
import Collection from "../contentCards/Collection";
import MdPlan from "../contentCards/MdPlan";
import TeamBuild from "../contentCards/TeamBuild";

const TOOLTIP_ID = "markdown-renderer-tooltip";

function MarkdownTooltipContent({ type, content }) {
    if (type === "build")
        return <div style={{ width: "auto" }}>
            <TeamBuild build={content} size={"M"} complete={false} />
        </div>

    if (type === "collection")
        return <div style={{ width: isTouchDevice() ? "350px" : "750px" }}>
            <Collection collection={content} complete={false} />
        </div>

    if (type === "md_plan")
        return <div style={{ width: "auto" }}>
            <MdPlan plan={content} complete={false} />
        </div>

    return null;
}

export function MarkdownTooltip() {
    return <TooltipTemplate
        id={TOOLTIP_ID}
        contentFunc={content => {
            if (!content) return null;
            const data = JSON.parse(decodeURIComponent(content));
            return <MarkdownTooltipContent type={data.type} content={data.content} />
        }}
        clickable={isTouchDevice()}
    />
}

export function getMarkdownTooltipProps(type, content) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": encodeURIComponent(JSON.stringify({ type: type, content: content }))
    }
}
