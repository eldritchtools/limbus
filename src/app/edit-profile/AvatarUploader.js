"use client";

import { useRef, useState } from "react";

import Avatar from "../components/icons/Avatar";
import { useAuth } from "../database/authProvider";
import { updateUserAvatar } from "../database/users";

export function AvatarUploader({ userId, avatarId, onUpdated }) {
    const { refreshProfile } = useAuth();
    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    async function handleFile(file) {
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/avatar", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        if (data?.id) {
            await updateUserAvatar(userId, data.id);
            refreshProfile();
            onUpdated(data.id);
        }

        setLoading(false);
    }

    async function removeAvatar() {
        setLoading(true);
        await updateUserAvatar(userId, null);
        refreshProfile();
        onUpdated(null);
        setLoading(false);
    }

    return <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Avatar avatarId={avatarId} size={64} />

        <button onClick={() => inputRef.current?.click()} disabled={loading}>
            Change avatar
        </button>

        <button onClick={removeAvatar} disabled={loading}>
            Remove avatar
        </button>

        <input ref={inputRef} type="file" hidden accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
            }}
        />
    </div>
}