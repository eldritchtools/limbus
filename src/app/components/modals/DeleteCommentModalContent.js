"use client";

import { useState } from "react";

import MarkdownRenderer from "../markdown/MarkdownRenderer";

import { deleteComment } from "@/app/database/comments";

export default function DeleteCommentModalContent({ targetType, commentId, commentBody, onDelete, onClose }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        await deleteComment(targetType, commentId);
        setDeleting(false);
        onDelete();
        onClose();
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
        <span>Are you sure you want to delete this comment?</span>
        <div style={{ textAlign: "left" }}><MarkdownRenderer content={commentBody} /></div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button disabled={deleting} onClick={() => handleDelete()}>Yes</button>
            <button onClick={() => onClose}>No</button>
        </div>
    </div>
}
