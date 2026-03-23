import { useState, useEffect } from "react";

export default function NumberInput({ min = null, max = null, value, onChange, allowEmpty = false, style = {} }) {
    const [local, setLocal] = useState(value.toString());

    useEffect(() => {
        setLocal(value.toString())
    }, [value]);

    const parse = (str) => {
        if (str === "" || str === "-") return null;
        const n = Number(str);
        return Number.isNaN(n) ? null : n;
    }

    const validate = (str) => {
        const num = parse(str);

        if (num !== null && (min === null || num >= min) && (max === null || num <= max)) {
            onChange(num);
        }
    }

    const handleChange = (val) => {
        setLocal(val);
        validate(val);
    };

    const commit = () => {
        if (allowEmpty && local === "") onChange("");
        let num = parse(local);
        if (num === null) {
            setLocal(String(value));
            return;
        }

        if (min !== null) num = Math.max(num, min);
        if (max !== null) num = Math.min(num, max);
        setLocal(String(num));
        onChange(num);
    };

    return (
        <input
            type="number"
            value={local}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    commit();
                    e.target.blur();
                }
            }}
            style={style}
        />
    );
}
