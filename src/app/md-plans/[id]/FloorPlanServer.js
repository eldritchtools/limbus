import FloorPlanClient from "./FloorPlanClient";
import styles from "./MdPlan.module.css";
import { GiftList, ThemePackList } from "./MdPlanPageComponents";

import MarkdownRendererServer from "@/app/components/markdown/MarkdownRendererServer";

function FloorItem({ floor, giftsData, themePacksData }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ fontSize: "1.2rem" }}>
            Floor: {floor.label.length > 0 ? floor.label : floor.floorSet}
        </div>
        <div className={styles.floorLayout}>
            <div style={{display: "flex", gap: "0.2rem"}}>
                <div className={`panel-container ${styles.floorPanel}`}>
                    <h3 style={{ margin: 0 }}>Theme Packs</h3>
                    <div className={styles.floorPanelItems}>
                        <ThemePackList themePackIds={floor.themePacks} themePacksData={themePacksData} />
                    </div>
                </div>

                <div className={`panel-container ${styles.floorPanel}`}>
                    <h3 style={{ margin: 0 }}>Gifts</h3>
                    <div className={styles.floorPanelItems}>
                        <GiftList giftIds={floor.gifts} giftsData={giftsData} panelList={true} />
                    </div>
                </div>
            </div>

            <div className={styles.floorNotes}>
                <MarkdownRendererServer content={floor.note} />
            </div>
        </div>
    </div>
}

export default function FloorPlanServer({ floors, giftsData, themePacksData }) {
    return <FloorPlanClient>
        {floors.map((floor, i) => <FloorItem key={i} floor={floor} giftsData={giftsData} themePacksData={themePacksData} />)}
    </FloorPlanClient>
}
