"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ModalContainer({ isOpen, onClose, index = 0, children }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setVisible(true));
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVisible(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const overlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: visible ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000 + index,
        transition: "background 150ms ease",
    };

    const contentStyle = {
        position: "relative",
        background: "black",
        padding: "0.5rem",
        borderRadius: "0.5rem",
        minWidth: "300px",
        maxWidth: "min(1600px, 90%)",
        border: "1px #aaa solid",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",

        transform: visible
            ? "translateY(0px) scale(1)"
            : "translateY(10px) scale(0.96)",
        opacity: visible ? 1 : 0,
        transition: "all 150ms cubic-bezier(0.22, 1, 0.36, 1)",
    };

    const closeStyle = {
        position: "absolute",
        top: "0.5rem",
        right: "0.5rem",
        background: "transparent",
        border: "none",
        fontSize: "1.25rem",
        cursor: "pointer",
    };

    return createPortal(
        <div style={overlayStyle} onClick={onClose}>
            <button style={closeStyle} onClick={onClose}>
                ✕
            </button>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.body
    );
}