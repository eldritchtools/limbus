import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";
import KeywordIcon from "../icons/KeywordIcon";

import { keywordToIdMapping } from "@/app/database/keywordIds";
import { checkFilterMatch } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

export function KeywordDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle }) {
    const optionsMapped = useMemo(() => Object.keys(keywordToIdMapping).reduce((acc, id) => {
        acc[id] = {
            value: id,
            label: <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <KeywordIcon id={id} />
                <span>{id}</span>
            </div>,
            name: id
        };
        return acc;
    }, {}), []);

    return <DropdownSelectorWithExclusion
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search Keywords..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={false}
    />;
}