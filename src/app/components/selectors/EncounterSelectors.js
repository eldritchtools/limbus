"use client";

import { useMemo } from "react";

import { useData } from "../DataProvider";
import DropdownSelectorWithExclusion from "./DropdownSelectorWithExclusion";

import { encounterCategoryLabels } from "@/app/lib/encounters";
import { checkFilterMatch, normalizeString } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

export function EncounterDropdownSelector({ selected, setSelected, isMulti = false, styles = selectStyle, excludeMode }) {
    const [encounters, loading] = useData("encounters");

    const optionsMapped = useMemo(() => {
        if (loading) return [];
        const list = [];

        Object.entries(encounters).forEach(([cat, encs]) => {
            Object.entries(encs).forEach(([id, label]) => {
                list.push({
                    value: `${cat}|${id}`,
                    label: `${encounterCategoryLabels[cat]}: ${label}`,
                    name: `${encounterCategoryLabels[cat]}: ${label}`
                });
            });
        });

        return list;
    }, [encounters, loading]);

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
        placeholder={"Search Encounters..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}