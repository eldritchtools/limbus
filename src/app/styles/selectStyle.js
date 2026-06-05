const selectStyle = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: "var(--bg-input)",
        color: "var(--primary-text-color)",
        borderColor: state.isFocused ? "var(--primary-border-color)" : "var(--secondary-border-color)",
        boxShadow: "none",
        "&:hover": { borderColor: "var(--primary-border-color)" },
        minHeight: "28px",
        minWidth: "15rem",
        maxWidth: "40rem"
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "var(--bg-input)",
        border: "1px solid var(--secondary-border-color)",
        maxWidth: "40rem",
        zIndex: 6
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused
            ? (state.isSelected ? "var(--bg-hover)" : "var(--bg-hover)" )
            : state.isSelected
                ? "var(--bg-hover)"
                : "transparent",
        color: "var(--primary-text-color)",
        cursor: "pointer",
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "var(--primary-text-color)",
    }),
    input: (provided) => ({
        ...provided,
        color: "var(--primary-text-color)",
    }),
    valueContainer: (provided) => ({
        ...provided,
        paddingRight: 0,
        minWidth: 1,
        flex: 1
    }),
    multiValue: (provided, state) => ({
        ...provided,
        backgroundColor: "var(--secondary-border-color)",
        border: state.data.exclude ? "2px solid #ef4444" : "transparent",
        // boxShadow: state.data.exclude ? "inset 0 0 0 1px rgba(239,68,68,0.25)" : null,
        borderRadius: "8px",
        padding: "2px 4px"
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: "var(--primary-text-color)",
        fontSize: "0.9em",
    }),
};

const selectStyleWide = {
    ...selectStyle,
    control: (provided, state) => ({
        ...provided,
        backgroundColor: "var(--bg-input)",
        color: "var(--primary-text-color)",
        borderColor: state.isFocused ? "var(--primary-border-color)" : "var(--secondary-border-color)",
        boxShadow: "none",
        "&:hover": { borderColor: "var(--primary-border-color)" },
        minHeight: "28px",
        width: "55rem"
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "var(--bg-input)",
        border: "1px solid var(--secondary-border-color)",
        minHeight: "28px",
        width: "55rem",
        zIndex: 6
    }),
};

const selectStyleVariable = {
    ...selectStyle,
    control: (provided, state) => ({
        ...provided,
        backgroundColor: "var(--bg-input)",
        color: "var(--primary-text-color)",
        borderColor: state.isFocused ? "var(--primary-border-color)" : "var(--secondary-border-color)",
        boxShadow: "none",
        "&:hover": { borderColor: "var(--primary-border-color)" },
        minHeight: "28px",
        width: "100%"
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "var(--bg-input)",
        border: "1px solid var(--secondary-border-color)",
        minHeight: "28px",
        width: "100%",
        zIndex: 6
    }),
};

const selectStyleSmall = {
    ...selectStyle,
    control: (provided, state) => ({
        ...provided,
        backgroundColor: "var(--bg-input)",
        color: "var(--primary-text-color)",
        borderColor: state.isFocused ? "var(--primary-border-color)" : "var(--secondary-border-color)",
        boxShadow: "none",
        "&:hover": { borderColor: "var(--primary-border-color)" },
        minHeight: "20px",
        width: "100%",
        fontSize: "0.75rem"
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "var(--bg-input)",
        border: "1px solid var(--secondary-border-color)",
        minHeight: "28px",
        minWidth: "max-content",
        zIndex: 6
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "var(--primary-text-color)"
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: "0 2px"
    }),
    clearIndicator: (base) => ({
        ...base,
        padding: "0 2px"
    }),
};

export { selectStyle, selectStyleWide, selectStyleVariable, selectStyleSmall };