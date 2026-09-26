import PanicIcon from "../icons/PanicIcon";
import ProcessedText from "../texts/ProcessedText";

function prependDash(text) {
    if(!text) return "";
    if(text[0] === '-') return text;
    return `- ${text}`;
}

export default function SanityCard({ sanityData, noTitle = false, noBorder = false }) {
    return <div style={{
        display: "flex", flexDirection: "column", padding: "0.5rem", gap: "0.2rem",
        border: noBorder ? "" : `1px #777 solid`, borderRadius: "0.5rem", boxSizing: "border-box"
    }}>
        {!noTitle && <div className="title-text">Sanity</div>}
        {sanityData ?
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.2rem" }}>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "min(400px, 100%)" }}>
                    <span style={{ fontWeight: "bold" }}>Panic Type</span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <PanicIcon id={sanityData.id} style={{ width: "96px" }} />
                            <span style={{ fontWeight: "bold" }}>{sanityData.name}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                            {sanityData.lowMoraleDesc.length > 0 && <>
                                <span>Low Morale</span>
                                <ProcessedText text={prependDash(sanityData.lowMoraleDesc)} />
                            </>}
                            {sanityData.panicDesc.length > 0 && <>
                                <span>Panic</span>
                                <ProcessedText text={prependDash(sanityData.panicDesc)} />
                            </>}
                        </div>
                    </div>
                </div>
                {sanityData.add.length > 0 &&
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "min(400px, 100%)" }}>
                        <span style={{ fontWeight: "bold", color: "#3B82D0" }}>Base Factors Increasing Sanity</span>
                        {sanityData.add.map((x, i) => <ProcessedText key={i} text={prependDash(x)} />)}
                    </div>
                }
                {sanityData.sub.length > 0 &&
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "min(400px, 100%)" }}>
                        <span style={{ fontWeight: "bold", color: "#D64545" }}>Base Factors Decreasing Sanity</span>
                        {(sanityData.sub ?? []).map((x, i) => <ProcessedText key={i} text={prependDash(x)} />)}
                    </div>
                }
            </div> :
            <span>Sanity Data Unavailable</span>
        }
    </div>
}
