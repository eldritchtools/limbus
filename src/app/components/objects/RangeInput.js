import { useState, useEffect } from "react";

export default function RangeInput({ min = 1, max = 99, value, onChange }) {
    const [localMin, setLocalMin] = useState(value[0].toString());
    const [localMax, setLocalMax] = useState(value[1].toString());

    useEffect(() => {
        setLocalMin(value[0].toString());
        setLocalMax(value[1].toString());
    }, [value]);

    const parse = (str) => {
        if (str === "" || str === "-") return null;
        const n = Number(str);
        return Number.isNaN(n) ? null : n;
    }

    const validate = (minStr, maxStr) => {
        const minNum = parse(minStr);
        const maxNum = parse(maxStr);

        if (minNum !== null && maxNum !== null && minNum >= min && maxNum <= max && minNum <= maxNum) {
            onChange([minNum, maxNum]);
        }
    }

    const handleMinChange = (val) => {
        setLocalMin(val);
        validate(val, localMax);
    };

    const handleMaxChange = (val) => {
        setLocalMax(val);
        validate(localMin, val);
    };

    const commitMin = () => {
        const num = parse(localMin);
        if (num === null) {
            setLocalMin(String(value[0]));
            return;
        }

        const clamped = Math.min(Math.max(num, min), value[1]);
        setLocalMin(String(clamped));
        onChange([clamped, value[1]]);
    };

    const commitMax = () => {
        const num = parse(localMax);
        if (num === null) {
            setLocalMax(String(value[1]));
            return;
        }

        const clamped = Math.max(Math.min(num, max), value[0]);
        setLocalMax(String(clamped));
        onChange([value[0], clamped]);
    };

    return (
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
                type="number"
                value={localMin}
                onChange={(e) => handleMinChange(e.target.value)}
                onBlur={commitMin}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        commitMin();
                        e.target.blur();
                    }
                }}
                style={{ width: "3ch", textAlign: "center" }}
            />
            <span> - </span>
            <input
                type="number"
                value={localMax}
                onChange={(e) => handleMaxChange(e.target.value)}
                onBlur={commitMax}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        commitMax();
                        e.target.blur();
                    }
                }}
                style={{ width: "3ch", textAlign: "center" }}
            />
        </div>
    );
}
