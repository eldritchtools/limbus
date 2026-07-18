import styles from "./gifts.module.css";
import GiftsPage from "./GiftsPage";
import { fetchData } from "../components/DataFetcherServer";
import Gift from "../components/gifts/Gift";

export default async function Page() {
    const gifts = await fetchData("gifts");

    const initGifts =
        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Results: {Object.keys(gifts).length}</h3>
            <span className="sub-text" style={{ marginBottom: ".5rem" }}>
                This count may include gifts that are no longer obtainable or are not part of the gift compendium.
            </span>
            <div className={styles.giftIconGrid}>
                {Object.entries(gifts).map(([id, gift]) => <div key={id} className={styles.giftIconContainer}>
                    <Gift gift={gift} includeTooltip={true} expandable={true} />
                </div>)}
            </div>
        </div>

    return <GiftsPage initGifts={initGifts} />
}
