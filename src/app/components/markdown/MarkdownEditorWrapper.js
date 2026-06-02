"use client";

import { useRef, useState } from "react";

import MarkdownEditorMain from "./MarkdownEditorMain";
import MarkdownRenderer from "./MarkdownRenderer";
import MarkdownTokensGuide from "./MarkdownTokensGuide";
import Icon from "../icons/Icon";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

const miniTooltip = "For smaller text boxes, the tokens guide is stripped to preserve the layout and save screen space, but they are still available. Type '{type:' to open the autocomplete window for tokens.\n\nQuick reference for types of important tokens:\nIdentities - identity or id\nE.G.Os - ego\nStatuses - status or st, statusicon or sti for icons only\nKeywords - keyword or kw\nGifts - giftname or gn, gifticons or gi for icons\nOther Icons - icon";

export default function MarkdownEditorWrapper({ value, onChange, placeholder, initialState = "detailed", short = false, mini = false }) {
    const [mode, setMode] = useState(initialState);
    const editorRef = useRef(null);
    const [guideTab, setGuideTab] = useState("none");
    const [guideValue, setGuideValue] = useState(null);
    const [guideOpen, setGuideOpen] = useState(false);

    if (mini) 
        return <div style={{display: "flex", flexDirection: "column", gap: "0.1rem"}}>
            <MarkdownEditorMain ref={editorRef} value={value} onChange={onChange} placeholder={placeholder} short={short} mini={mini} />
            <span {...getGeneralTooltipProps(miniTooltip)} className="sub-text" style={{textAlign: "center"}}>Tokens are available. Hover for more details.</span>
        </div>

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
        <div style={{ display: "flex", marginBottom: "0.5rem", gap: "1rem", alignItems: "center" }}>
            <div className={`tab-header ${mode === "detailed" ? "active" : ""}`} style={{ fontSize: "1rem" }} onClick={() => setMode("detailed")}>Detailed</div>
            <div className={`tab-header ${mode === "simple" ? "active" : ""}`} style={{ fontSize: "1rem" }} onClick={() => setMode("simple")}>Simple</div>
            <div className={`tab-header ${mode === "preview" ? "active" : ""}`} style={{ fontSize: "1rem" }} onClick={() => setMode("preview")}>Preview</div>
        </div>
        {mode === "detailed" ?
            <div>
                <button className="toggle-button" onClick={() => setGuideOpen(p => !p)} style={{display: "flex", alignItems: "center"}}>
                    <Icon path={"coin"} style={{ height: "24px", width: "24px" }} />
                    Toggle Tokens Guide (Use tokens for better text)
                </button>
            </div> :
            null
        }
        {mode === "detailed" ? <MarkdownEditorMain ref={editorRef} value={value} onChange={onChange} placeholder={placeholder} short={short} /> : null}
        {mode === "simple" &&
        <> 
            <textarea ref={editorRef} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ height: "12ch" }} />
            <span className="sub-text">Swap to detailed mode to use Markdown or Tokens.</span>
        </>
        }
        {mode === "preview" ?
            <div style={{ border: "1px var(--secondary-border-color) solid", padding: "0.5rem" }}>
                <MarkdownRenderer content={value} />
            </div> : null}
        {guideOpen ?
            <div style={{ border: "1px var(--secondary-border-color) solid", padding: "0.5rem" }}>
                <MarkdownTokensGuide editorRef={editorRef} onChange={onChange} guideTab={guideTab} setGuideTab={setGuideTab} guideValue={guideValue} setGuideValue={setGuideValue} />
            </div> : null}
    </div>
}