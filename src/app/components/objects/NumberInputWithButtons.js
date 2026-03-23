import NumberInput from "./NumberInput";

function NumberInputWithButtons({ value, setValue, min = 1, max = 100, allowEmpty = false }) {
    return (
        <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #444", borderRadius: "8px", padding: "4px" }}>
            <button
                onClick={() => setValue(Math.max(min, (value ?? 0) - 1))}
                style={{ marginRight: "6px" }}
            >−</button>
            <NumberInput
                min={min}
                max={max}
                value={value}
                onChange={setValue}
                allowEmpty={allowEmpty}
                style={{ width: "3ch", textAlign: "center", border: "none", background: "transparent", fontSize: "1rem" }}
            />
            <button
                onClick={() => setValue(Math.min(max, (value ?? 0) + 1))}
                style={{ marginLeft: "6px" }}
            >+</button>
        </div>
    );
}

export default NumberInputWithButtons;
