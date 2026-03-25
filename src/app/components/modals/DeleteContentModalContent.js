"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { isLocalId } from "@/app/database/localDB";
import { contentConfig } from "@/app/lib/contentConfig";

const targetMapping = {
    "build": contentConfig.builds,
    "collection": contentConfig.collections,
    "md_plan": contentConfig.md_plans
}

export default function DeleteContentModalContent({ targetType, targetId, title, onClose }) {
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setDeleting(true);
        if (isLocalId(targetId)) {
            await targetMapping[targetType].local.remove(Number(targetId));
            onClose();
            router.push(`/my-profile`);
        } else {
            const data = await targetMapping[targetType].delete(targetId);
            if (data && data.deleted) {
                onClose();
                router.push(`/${contentConfig[targetType].path}`);
            }
        }
        setDeleting(false);
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
        <span>Are you sure you want to delete {title}?</span>
        <span>This is a non-recoverable action.</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => handleDelete()} disabled={deleting}>Yes</button>
            <button onClick={() => onClose()}>No</button>
        </div>
    </div>
}
