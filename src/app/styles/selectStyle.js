const selectStyle = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: "#2a2a2a",
        color: "#ddd",
        borderColor: state.isFocused ? "#888" : "#555",
        boxShadow: "none",
        "&:hover": { borderColor: "#888" },
        minHeight: "28px",
        minWidth: "15rem",
        maxWidth: "40rem"
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#2a2a2a",
        border: "1px solid #555",
        maxWidth: "40rem",
        zIndex: 6
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused
            ? (state.isSelected ? "#555" : "#444" )
            : state.isSelected
                ? "#555"
                : "transparent",
        color: "#ddd",
        cursor: "pointer",
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "#ddd",
    }),
    input: (provided) => ({
        ...provided,
        color: "#ddd",
    }),
    valueContainer: (provided) => ({
        ...provided,
        paddingRight: 0,
        minWidth: 1,
        flex: 1
    }),
    multiValue: (provided, state) => ({
        ...provided,
        backgroundColor: "#555",
        border: state.data.exclude ? "2px solid #ef4444" : "transparent",
        boxShadow: state.data.exclude ? "inset 0 0 0 1px rgba(239,68,68,0.25)" : null,
        borderRadius: "8px",
        padding: "2px 4px"
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: "#ddd",
        fontSize: "0.9em",
    }),
};

const selectStyleWide = {
    ...selectStyle,
    control: (provided, state) => ({
        ...provided,
        backgroundColor: "#2a2a2a",
        color: "#ddd",
        borderColor: state.isFocused ? "#888" : "#555",
        boxShadow: "none",
        "&:hover": { borderColor: "#888" },
        minHeight: "28px",
        width: "55rem"
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#2a2a2a",
        border: "1px solid #555",
        minHeight: "28px",
        width: "55rem",
        zIndex: 6
    }),
};

const selectStyleVariable = {
    ...selectStyle,
    control: (provided, state) => ({
        ...provided,
        backgroundColor: "#2a2a2a",
        color: "#ddd",
        borderColor: state.isFocused ? "#888" : "#555",
        boxShadow: "none",
        "&:hover": { borderColor: "#888" },
        minHeight: "28px",
        width: "100%"
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#2a2a2a",
        border: "1px solid #555",
        minHeight: "28px",
        width: "100%",
        zIndex: 6
    }),
};

export { selectStyle, selectStyleWide, selectStyleVariable };