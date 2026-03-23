import { useRef, useState } from "react";

import styles from "./TeamCodeComponent.module.css";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

export default function TeamCodeComponent({ teamCode }) {
    const teamCodeRef = useRef(null);
    const [copySuccess, setCopySuccess] = useState('');

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

    return <div style={{ display: "flex", flexDirection: "column", width: "300px", alignItems: "center", border: "1px #777 solid", borderRadius: "1rem" }}>
        <div>
            <span style={{ fontSize: "1.2rem", borderBottom: "1px #ddd dotted" }} {...getGeneralTooltipProps("teamcode")}>Team Code</span>
        </div>
        <div style={{ position: "relative", width: "100%" }}>
            <textarea value={teamCode} ref={teamCodeRef} readOnly={true} style={{ width: "100%", height: "3rem", cursor: "pointer" }} onClick={handleTeamCodeCopy} />
            {copySuccess !== '' ?
                <div className={styles.copyPopup}>
                    <div className={styles.copyPopupBox}>
                        {copySuccess}
                    </div>
                </div> :
                null
            }
        </div>
    </div>
}
