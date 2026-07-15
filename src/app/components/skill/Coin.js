import styles from "./Coin.module.css";
import Icon from "../icons/Icon";

import { romanMapping } from "@/app/lib/constants";

export default function Coin({ num, mini }) {
    const miniClass = mini ? styles.mini : null;
    
    return <div className={`${styles.coinContainer} ${miniClass}`}>
        <Icon className={mini ? styles.coinMini : styles.coin} path={"Coin Outline"} />
        <div className={`${styles.coinNumber} ${miniClass}`}> {romanMapping[num]} </div>
    </div>
}