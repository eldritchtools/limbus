import { useBreakpoint } from "@eldritchtools/shared-components";
import { useRef, useState } from "react";

import BuildDisplayMenuCard from "./BuildDisplayMenuCard";
import styles from "./TeamCodeComponent.module.css";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

export default function TeamCodeComponent({ teamCode, setTeamCode, editable }) {
    const teamCodeRef = useRef(null);
    const [copySuccess, setCopySuccess] = useState('');
    const { isMobile } = useBreakpoint();

    const handleTeamCodeCopy = async () => {
        if (teamCodeRef.current) {
            try {
                await navigator.clipboard.writeText(teamCodeRef.current.value);
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            } catch (err) {
                setCopySuccess('Failed to copy!');
                setTimeout(() => setCopySuccess(''), 2000);
                console.error('Failed to copy text: ', err);
            }
        }
    };

    return <BuildDisplayMenuCard>
        <div>
            <span className="hover-text" style={{ fontSize: "1.2rem" }} {...getGeneralTooltipProps("teamcode")}>Team Code</span>
        </div>
        <div style={{ position: "relative", width: "100%" }}>
            <textarea
                ref={teamCodeRef}
                value={teamCode}
                readOnly={!editable}
                style={{ width: isMobile ? "150px" : "200px", height: "3.5rem", cursor: "pointer" }}
                onClick={editable ? null : handleTeamCodeCopy}
                onChange={editable ? e => setTeamCode(e.target.value) : undefined}
                onFocus={editable ? e => e.target.select() : null}
            />
            {copySuccess !== '' ?
                <div className={styles.copyPopup}>
                    <div className={styles.copyPopupBox}>
                        {copySuccess}
                    </div>
                </div> :
                null
            }
        </div>
    </BuildDisplayMenuCard>
}
