"use client";

import { useData } from "../DataProvider";
import Status from "../objects/Status";
import { useSiteCustomization } from "../SiteCustomizationProvider";
import ProcessedText from "../texts/ProcessedText";

const descStyle = { display: "inline-block", fontSize: "1rem", lineHeight: "1.5", maxWidth: "75rem", textWrap: "wrap", whiteSpace: "pre-wrap", textAlign: "start" };

export default function StatusModalContent({ id }) {
    const { getCustomizationValue } = useSiteCustomization();
    const [statuses, statusesLoading] = useData("statuses");

    if (statusesLoading) return null;
    const status = statuses[id];

    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", fontSize: "1rem", fontWeight: "bold" }}>
            <Status status={status} includeTooltip={false} />
            {getCustomizationValue("showIdsOnTooltips") && <span>&nbsp;({status.id})</span>}
        </div>
        <div style={descStyle}>
            <span>{status.desc}</span>
        </div>
        {status.flavor &&
            <div className="sub-text" style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap" }}>
                <ProcessedText text={status.flavor} />
            </div>
        }
    </div>;
}
