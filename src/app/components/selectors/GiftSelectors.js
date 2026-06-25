"use client";

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

export function GiftTriggersSelector({ selected, setSelected, isMulti = false, styles = selectStyle, giftOptions, excludeMode }) {
    const optionsMapped = useMemo(() => {
        if (!giftOptions) return {};

        const triggersToOptions = list => list.reduce((acc, trigger) => {
            acc[trigger] = {
                value: trigger,
                label: trigger,
                name: trigger
            }
            return acc;
        }, {});

        const triggers = new Set();
        giftOptions.forEach(gift => (gift.triggers ?? []).forEach(trigger => triggers.add(trigger)));
        return triggersToOptions([...triggers]);
    },
        [giftOptions]
    );

    const optionsSorted = useMemo(() =>
        Object.values(optionsMapped).sort((a, b) =>
            normalizeString(a.name).localeCompare(normalizeString(b.name))
        ),
        [optionsMapped]
    );

    console.log(giftOptions, optionsMapped, optionsSorted)

    return <DropdownSelectorWithExclusion
        options={optionsSorted}
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search Triggers..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}

export function GiftEffectsSelector({ selected, setSelected, isMulti = false, styles = selectStyle, giftOptions, excludeMode }) {
    const optionsMapped = useMemo(() => {
        if (!giftOptions) return {};

        const effectsToOptions = list => list.reduce((acc, effect) => {
            acc[effect] = {
                value: effect,
                label: effect,
                name: effect
            }
            return acc;
        }, {});

        const effects = new Set();
        giftOptions.forEach(gift => (gift.effects ?? []).forEach(effect => effects.add(effect)));
        return effectsToOptions([...effects]);
    },
        [giftOptions]
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
        placeholder={"Search Effects..."}
        filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}