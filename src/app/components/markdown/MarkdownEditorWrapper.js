"use client";

import { useRef, useState } from "react";

import MarkdownEditorMain from "./MarkdownEditorMain";
import MarkdownRenderer from "./MarkdownRenderer";
import MarkdownTokensGuide from "./MarkdownTokensGuide";

export default function MarkdownEditorWrapper({ value, onChange, placeholder, short = false }) {
    const [mode, setMode] = useState("edit");
    const modeStyle = { fontSize: "1rem", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" };
    const editorRef = useRef(null);
    const [guideTab, setGuideTab] = useState("none");
    const [guideValue, setGuideValue] = useState(null);
    const [guideOpen, setGuideOpen] = useState(false);

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
        <div style={{ display: "flex", marginBottom: "0.5rem", gap: "1rem", alignItems: "center" }}>
            <div style={{ ...modeStyle, color: mode === "edit" ? "#ddd" : "#777" }} onClick={() => setMode("edit")}>Edit</div>
            <div style={{ ...modeStyle, color: mode === "preview" ? "#ddd" : "#777" }} onClick={() => setMode("preview")}>Preview</div>
            <button className="toggle-button" onClick={() => setGuideOpen(p => !p)}>Toggle Tokens Guide</button>
        </div>
        {mode === "edit" ? <MarkdownEditorMain ref={editorRef} value={value} onChange={onChange} placeholder={placeholder} short={short} /> : null}
        {mode === "preview" ?
            <div style={{ border: "1px #777 solid", padding: "0.5rem" }}>
                <MarkdownRenderer content={value} />
            </div> : null}
        {guideOpen ?
            <div style={{ border: "1px #777 solid", padding: "0.5rem" }}>
                <MarkdownTokensGuide editorRef={editorRef} onChange={onChange} guideTab={guideTab} setGuideTab={setGuideTab} guideValue={guideValue} setGuideValue={setGuideValue} />
            </div> : null}
    </div>
}