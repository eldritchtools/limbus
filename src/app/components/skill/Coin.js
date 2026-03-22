import Icon from "../icons/Icon";

import { romanMapping } from "@/app/lib/constants";

export default function Coin({ num, mini }) {
    const size = mini ? "1.2rem" : "1.5rem";
    const fontSize = mini ? "0.8rem" : "1rem";

    return <div style={{ position: "relative", height: size, width: size, verticalAlign: "center" }}>
        <Icon path={"Coin Outline"} style={{ height: size, width: size }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: fontSize }}> {romanMapping[num]} </div>
    </div>
}