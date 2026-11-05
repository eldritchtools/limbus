import NumberInput from "./NumberInput";

const padStyle = { border: "1px solid var(--secondary-border-color)", borderRadius: "8px", padding: "2px" };

function NumberInputWithButtons({ value, setValue, min = 1, max = 100, allowEmpty = false, vertical = false, inputStyle = {}, mini = false }) {
    const baseStyle = { display: vertical ? "flex" : "inline-flex", flexDirection: vertical ? "column" : null, alignItems: "center" };
    const style = mini ? baseStyle : { ...baseStyle, ...padStyle };

    return <div style={style}>
        {vertical ?
            <button
                onClick={() => setValue(Math.min(max, (value ?? 0) + 1))}
            // style={{ marginLeft: "6px" }}
            >+</button> :
            <button
                onClick={() => setValue(Math.max(min, (value ?? 0) - 1))}
                style={{ marginRight: "2px" }}
            >−</button>
        }
        <NumberInput
            min={min}
            max={max}
            value={value}
            onChange={setValue}
            allowEmpty={allowEmpty}
            style={{ width: "3ch", textAlign: "center", border: "none", background: "transparent", fontSize: "1rem", ...inputStyle }}
        />
        {vertical ?
            <button
                onClick={() => setValue(Math.max(min, (value ?? 0) - 1))}
            // style={{ marginRight: "6px" }}
            >−</button> :
            <button
                onClick={() => setValue(Math.min(max, (value ?? 0) + 1))}
                style={{ marginLeft: "2px" }}
            >+</button>
        }
    </div>;
}

export default NumberInputWithButtons;
