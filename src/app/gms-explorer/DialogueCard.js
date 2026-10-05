import { useBreakpoint } from "@eldritchtools/shared-components";
import React from "react";

import styles from "./MapViewer.module.css";
import ProcessedText from "../components/texts/ProcessedText";

export default function DialogueCard({ id, dialogue, greyed, clickable, expanded }) {
    const { isMobile } = useBreakpoint();

    return <div key={id}
        className={`${styles.itemCard} ${clickable ? styles.hover : null}`}
        style={{
            "--item-brightness": greyed ? 0.5 : 1,
            "--item-grayscale": greyed ? 0.75 : 0,
            width: expanded ? "100%" : undefined,
            padding: "0.5rem"
        }}
        onClick={clickable ?? null}
    >
        <span style={{ fontWeight: "bold", textAlign: "center", marginBottom: expanded ? "1rem" : null }}>{dialogue.notes}</span>
        {expanded &&
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? 200 : 400}px, 1fr))`, width: "100%", gap: "0.5rem" }}>
                {dialogue.parts.map((part, index) => <div key={index} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontWeight: "bold", textAlign: "center" }}>{part.notes}</span>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(50px, auto) 1fr", gap: "1rem" }}>
                        {part.texts.map((text, i) => <React.Fragment key={i}>
                            {text.speaker ? <div style={{ textAlign: "end" }}>{text.speaker}</div> : <div />}
                            <div>{text.speaker === "Dante" ? "<" : null}<ProcessedText text={text.text} /></div>
                        </React.Fragment>)}
                    </div>
                </div>)}
            </div>
        }
    </div>
}