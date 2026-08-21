"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Avatar from "../icons/Avatar";

export function AvatarUploader({ avatarId, onUpdated }) {
    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleFile = useCallback(async file => {
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/avatar", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        if (data?.id) await onUpdated(data.id);
        setLoading(false);
    }, [onUpdated]);

    async function removeAvatar() {
        setLoading(true);
        await onUpdated(null);
        setLoading(false);
    }

    useEffect(() => {
        const isTypingTarget = el => {
            if (!el) return false;

            const tag = el.tagName;
            return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
        }

        const handlePaste = e => {
            if (isTypingTarget(e.target)) return;
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (["image/png", "image/jpeg", "image/bmp", "image/webp"].includes(item.type)) {
                    const file = item.getAsFile();
                    if (file) handleFile(file);
                }
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [handleFile]);

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
