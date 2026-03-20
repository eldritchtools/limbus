"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

const overlayStyle = {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "1000"
};

const contentStyle = {
    background: "black",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    minWidth: "300px",
    maxWidth: "90%",
    border: "1px #aaa solid",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
};

const closeStyle = {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    background: "transparent",
    border: "none",
    fontSize: "1.25rem",
    cursor: "pointer"
}

export default function ModalContainer({ isOpen, onClose, index = 0, children }) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div style={{ ...overlayStyle, zIndex: `${1000 + index}` }} onClick={onClose}>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
                <button style={closeStyle} onClick={onClose}>
                    ✕
                </button>
                {children}
            </div>
        </div>,
        document.body
    );
}
