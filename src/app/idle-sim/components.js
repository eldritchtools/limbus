import Icon from "../components/icons/Icon";
import KeywordIcon from "../components/icons/KeywordIcon";
import { ColoredResistance } from "../lib/colors";
import { affinities } from "../lib/constants";

export function StatTable({ data }) {
    return <div style={{ display: "grid", gridTemplateColumns: "repeat(8, auto)", gap: "0.1rem", alignItems: "center", justifyItems: "center" }}>
        <div />
        {affinities.map(x => <KeywordIcon key={x} id={x} size={32} />)}
        {data.offense && <>
            <Icon path={"offense level"} size={32} />
            {data.offense.map((x, i) =>
                <span key={`off-${i}`} style={{ color: x === 0 ? "var(--disabled-text-color)" : undefined }}>{x}</span>
            )}
        </>}
        {data.defense && <>
            <Icon path={"defense level"} size={32} />
            {data.defense.map((x, i) =>
                <ColoredResistance key={`def-${i}`} resist={x} />
            )}
        </>}
    </div>
}