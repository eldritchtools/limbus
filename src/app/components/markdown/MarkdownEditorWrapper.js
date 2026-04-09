"use client";

import { useRef, useState } from "react";

import MarkdownEditorMain from "./MarkdownEditorMain";
import MarkdownRenderer from "./MarkdownRenderer";
import MarkdownTokensGuide from "./MarkdownTokensGuide";

export default function MarkdownEditorWrapper({ value, onChange, placeholder, initialState = "detailed", short = false, mini = false }) {
    const [mode, setMode] = useState(initialState);
    const editorRef = useRef(null);
    const [guideTab, setGuideTab] = useState("none");
    const [guideValue, setGuideValue] = useState(null);
    const [guideOpen, setGuideOpen] = useState(false);

    if (mini)
        return <MarkdownEditorMain ref={editorRef} value={value} onChange={onChange} placeholder={placeholder} short={short} mini={mini} />

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
        <div style={{ display: "flex", marginBottom: "0.5rem", gap: "1rem", alignItems: "center" }}>
            <div className={`tab-header ${mode === "detailed" ? "active" : ""}`} style={{ fontSize: "1rem" }} onClick={() => setMode("detailed")}>Detailed</div>
            <div className={`tab-header ${mode === "simple" ? "active" : ""}`} style={{ fontSize: "1rem" }} onClick={() => setMode("simple")}>Simple</div>
            <div className={`tab-header ${mode === "preview" ? "active" : ""}`} style={{ fontSize: "1rem" }} onClick={() => setMode("preview")}>Preview</div>
        </div>
        {mode === "detailed" ?
            <div>
                <button className="toggle-button" onClick={() => setGuideOpen(p => !p)}>Toggle Tokens Guide (Use tokens for better text)</button>
            </div> :
            null
        }
        {mode === "detailed" ? <MarkdownEditorMain ref={editorRef} value={value} onChange={onChange} placeholder={placeholder} short={short} /> : null}
        {mode === "simple" ? <textarea ref={editorRef} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ height: "12ch" }} /> : null}
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