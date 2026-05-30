"use client";

import { useRef, useState } from "react";

export function ImageUploader({ onImageUploaded, disabled }) {
    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    async function handleFile(file) {
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/image", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        if (data?.id) onImageUploaded(data.id);

        setLoading(false);
    }

    return <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button onClick={() => inputRef.current?.click()} disabled={loading || disabled}>
            Upload Image
        </button>

        <input ref={inputRef} type="file" hidden accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
            }}
        />
    </div>
}