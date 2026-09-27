import styles from "./MapViewer.module.css";
import { useData } from "../components/DataProvider";

const titleMapping = {
    "shop": x => `Shop: ${x.name}`,
    "drop": x => `Enemy: ${x.name}`,
    "interaction": _ => "Interaction",
    "quest": _ => "Quest"
}

export default function MarkerPopover({ marker, inDiv = false, onClose }) {
    const [items, itemsLoading] = useData("rpg/items");
    const className = inDiv ? null : styles.popover;
    const style = inDiv ? null : { left: marker.x, top: marker.y }

    return <div className={className} style={style}>
        <div className={styles.popoverHeader}>
            <strong>{titleMapping[marker.type](marker)}</strong>

            <button type="button" onClick={() => onClose()} aria-label="Close">
                ×
            </button>
        </div>

        {process.env.NODE_ENV === "development" &&
            <span>
                {marker.id}
            </span>
        }

        {marker.notes && <span className={styles.item}>
            {marker.notes}
        </span>}

        {itemsLoading ?
            <span className={styles.popoverSectionTitle}>Loading...</span> :
            <div className={styles.popoverContent}>
                {marker.type === "shop" && (
                    <>
                        <div className={styles.popoverSectionTitle}>Items</div>

                        {marker.items?.map(({ itemId, price }) => {
                            const item = items[itemId];
                            return <div key={itemId} className={styles.item}>
                                <span>{item.name}</span>
                                <span>{price}</span>
                            </div>
                        })}
                    </>
                )}

                {marker.type === "drop" && (
                    <>
                        <div className={styles.popoverSectionTitle}>Drops</div>

                        {marker.items?.map(itemId => {
                            const item = items[itemId];
                            return <div key={itemId} className={styles.item}>
                                <span>{item.name}</span>
                            </div>
                        })}
                    </>
                )}

                {marker.type === "interaction" && (
                    <>
                        <div className={styles.popoverSectionTitle}>Items</div>

                        {marker.items?.map(itemId => {
                            const item = items[itemId];
                            return <div key={itemId} className={styles.item}>
                                <span>{item.name}</span>
                            </div>
                        })}
                    </>
                )}

                {marker.type === "quest" && (
                    <>
                        <div className={styles.popoverSectionTitle}>Items</div>

                        {marker.items?.map(itemId => {
                            const item = items[itemId];
                            return <div key={itemId} className={styles.item}>
                                <span>{item.name}</span>
                            </div>
                        })}
                    </>
                )}
            </div>
        }
    </div>
}