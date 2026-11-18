"use client";

import { useAuth } from "@/app/database/authProvider";

export default function LogoutModalContent({ onClose }) {
    const { user, logout } = useAuth();

    if (!user) onClose();

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "0.5rem" }}>
        <span>Are you sure you want to log out?</span>
        <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={onClose}>No</button>
            <button onClick={logout}>Yes</button>
        </div>
    </div>;
}
