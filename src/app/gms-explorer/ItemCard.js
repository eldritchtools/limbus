import styles from "./MapViewer.module.css";
import { itemsTypeMapping } from "./util";
import RPGItemIcon from "../components/icons/RPGItemIcon";
import ProcessedText from "../components/texts/ProcessedText";


export default function ItemCard({ id, item, greyed, clickable, showSources = false, handleGoToMarker }) {
    return <div key={id}
        className={`${styles.itemCard} ${clickable ? styles.hover : null}`}
        style={{
            "--item-brightness": greyed ? 0.5 : 1,
            "--item-grayscale": greyed ? 0.75 : 0
        }}
        onClick={clickable ?? null}
    >
        <span style={{ fontWeight: "bold" }}>{item.name}</span>
        <span className="sub-text">{itemsTypeMapping[item.type]}</span>
        <div style={{ display: "flex", gap: "0.5rem", alignSelf: "start" }}>
            <RPGItemIcon id={id} style={{ width: "64px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {item.statText && <ProcessedText text={item.statText} />}
                {item.desc && <span className="sub-text"><ProcessedText text={item.desc} /></span>}
            </div>
        </div>
        {showSources && <div style={{ display: "flex", flexDirection: "column", alignSelf: "start" }}>
            <span>Sources:</span>
            {(item.sources ?? []).map(({ route, floor, marker }) =>
                <span key={`${route}-${floor}-${marker}`} className="text-link" onClick={() => handleGoToMarker(route, floor, marker)}>
                    Route: {route.toUpperCase()}, Floor: {floor}
                </span>
            )}
        </div>}
    </div>
}