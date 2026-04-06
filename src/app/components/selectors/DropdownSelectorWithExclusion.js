"use client";

// import dynamic from "next/dynamic";
// const Select = dynamic(() => import("react-select"), { ssr: false });
import { useMemo } from "react";
import Select from "react-select";

export default function DropdownSelectorWithExclusion({ options, optionsMapped, selected, setSelected, placeholder, filterFunction, isMulti, styles, excludeMode }) {
    const mapped = useMemo(() => {
        if (optionsMapped) return optionsMapped;
        return options.reduce((acc, x) => { acc[x.value] = x; return acc }, {});
    }, [options, optionsMapped]);

    const value = useMemo(() => {
        if (isMulti) {
            return selected.map((id) => {
                const exclude = id[0] === '-';
                const val = { ...mapped[exclude ? id.slice(1) : id] };
                if (exclude) val.exclude = true;
                return val;
            })
        } else {
            return selected ? mapped[selected] : [selected];
        }
    }, [isMulti, selected, mapped]);

    const onChangeFunction = items => {
        if (isMulti) {
            setSelected(items.map(item =>
                selected.find(x => (x[0] === '-' ? x.slice(1) : x) === item.value) ?? (excludeMode ? `-${item.value}` : item.value)
            ));
        } else {
            setSelected(items ? items.value : items);
        }
    }

    if (Object.keys(mapped).length === 0) return <div />;

    return <Select
        isMulti={isMulti}
        isClearable={true}
        options={options || Object.values(mapped)}
        value={value}
        onChange={onChangeFunction}
        placeholder={placeholder}
        filterOption={filterFunction}
        styles={styles}
    />;
}