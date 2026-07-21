"use client";

import { useState } from "react";

import styles from "./MdPlan.module.css";

import { getGeneralTooltipProps } from "@/app/components/tooltips/GeneralTooltip";

export default function FloorPlanClient({ children }) {
    const [hideDescriptions, setHideDescriptions] = useState(false);

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label>
                <input type="checkbox" checked={hideDescriptions} onChange={e => setHideDescriptions(e.target.checked)} />
                <span {...getGeneralTooltipProps("This will hide floor descriptions, allowing you to see the floor plan in a more compact manner.")}
                    className="hover-text"
                >
                    Hide Floor Descriptions
                </span>
            </label>
        </div>
        <div className={hideDescriptions ? styles.hideDescriptions : styles.showDescriptions}>
            {children}
        </div>
    </div>
}
