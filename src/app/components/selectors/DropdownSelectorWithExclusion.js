import dynamic from "next/dynamic";
import { useMemo } from "react";
const Select = dynamic(() => import("react-select"), { ssr: false });

export default function DropdownSelectorWithExclusion({ options, optionsMapped, selected, setSelected, placeholder, filterFunction, isMulti, styles, excludeMode }) {
    const value = useMemo(() => {
        if (isMulti) {
            return selected.map((id) => {
                const exclude = id[0] === '-';
                const val = { ...optionsMapped[exclude ? id.slice(1) : id] };
                if (exclude) val.exclude = true;
                return val;
            })
        } else {
            return selected ? optionsMapped[selected] : [selected];
        }
    }, [isMulti, selected, optionsMapped]);

    const onChangeFunction = items => {
        if (isMulti) {
            setSelected(items.map(item =>
                selected.find(x => (x[0] === '-' ? x.slice(1) : x) === item.value) ?? (excludeMode ? `-${item.value}` : item.value)
            ));
        } else {
            setSelected(items ? items.value : items);
        }
    }

    return <Select
        isMulti={isMulti}
        isClearable={true}
        options={options || Object.values(optionsMapped)}
        value={value}
        onChange={onChangeFunction}
        placeholder={placeholder}
        filterOption={filterFunction}
        styles={styles}
    />;
}