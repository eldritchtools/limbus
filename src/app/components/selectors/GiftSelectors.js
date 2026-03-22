import { useMemo } from "react";

import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";

import { checkFilterMatch, normalizeString } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

export function GiftDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle }) {
    const [gifts, loading] = useData("gifts");

    const optionsMapped = useMemo(() => loading ? [] : Object.entries(gifts).reduce((acc, [id, gift]) => {
        acc[id] = {
            value: id,
            label: gift.names[0],
            name: gift.names[0]
        };
        return acc;
    }, {}), [gifts, loading]);

    const optionsSorted = useMemo(() => Object.values(optionsMapped).sort((a, b) => normalizeString(a.name).localeCompare(normalizeString(b.name))), [optionsMapped]);

    return <DropdownSelectorWithExclusion
        options={optionsSorted}
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search Gifts..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={false}
    />;
}