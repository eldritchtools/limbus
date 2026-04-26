"use client";

import { useMemo } from "react";

import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";
import ProcessedText, { processText } from "../texts/ProcessedText";

import { checkFilterMatch, normalizeString } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

export function FactionDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle, options, excludeMode }) {
    const [identities, loading] = useData("identities", options === undefined);

    const optionsMapped = useMemo(() => {
        if (!options && loading) return [];

        const tagListToOptions = list => list.reduce((acc, tag) => {
            acc[tag] = {
                value: tag,
                label: <ProcessedText text={tag} />,
                name: processText(tag)
            }
            return acc;
        }, {});

        if (options) return tagListToOptions(options);

        const tags = new Set();
        Object.values(identities).forEach(identity => (identity.tags ?? []).forEach(tag => tags.add(tag)));
        return tagListToOptions([...tags]);
    },
        [identities, options, loading]
    );

    const optionsSorted = useMemo(() =>
        Object.values(optionsMapped).sort((a, b) =>
            normalizeString(a.name).localeCompare(normalizeString(b.name))
        ),
        [optionsMapped]
    );

    return <DropdownSelectorWithExclusion
        options={optionsSorted}
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search Factions..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}