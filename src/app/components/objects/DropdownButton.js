"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./DropdownButton.module.css";

export default function DropdownButton({ value, setValue, options, defaultDisplay, left = true, styleOverride = {} }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const menuRef = useRef(null);
    const [rect, setRect] = useState(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleOpen = () => {
        setOpen(o => !o);
        if (ref.current) setRect(ref.current.getBoundingClientRect());
    }

    const extraStyle = {};
    if(rect){
        extraStyle.top = rect.bottom;
        extraStyle.left = rect.left;
    }

    return <div ref={ref} style={{ position: "relative" }}>
        <button onClick={handleOpen} style={styleOverride}>
            {value in options ? options[value] : (defaultDisplay ?? Object.values(options)[0])}
        </button>

        {open && (
            createPortal(
                <div ref={menuRef} className={styles.dropdownMenu} style={extraStyle}>
                    {Object.entries(options).map(([k, v]) => (
                        <div key={k} className={styles.dropdownButtonOption} onClick={k => { setValue(k); setOpen(false); }} >
                            {v}
                        </div>
                    ))}
                </div>,
                document.body
            )
        )}
    </div>;
}