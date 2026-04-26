"use client";

import { useEffect, useState } from "react";

import { useModal } from "../modals/ModalProvider";
import Username from "../user/Username";
import UsernameWithTime from "../user/UsernameWithTime";

import MarkdownEditorWrapper from "@/app/components/markdown/MarkdownEditorWrapper";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import { useAuth } from "@/app/database/authProvider";
import { pinBuildComment, unpinBuildComment } from "@/app/database/builds";
import { pinCollectionComment, unpinCollectionComment } from "@/app/database/collections";
import { addComment, getComments, updateComment } from "@/app/database/comments";
import { pinMdPlanComment, unpinMdPlanComment } from "@/app/database/mdPlans";

function CommentInput({ targetType, targetId, parentId = null, editId = null, initialValue = "", onEdit, onPost, onCancel }) {
    const [body, setBody] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!body.trim()) return;
        setLoading(true);

        if (editId) {
            await updateComment(targetType, editId, body);
            setBody("");
            setLoading(false);
            onEdit?.(body);
        } else {
            const data = await addComment(targetType, targetId, body, parentId);
            setBody("");
            setLoading(false);
            onPost?.(data);
        }
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <MarkdownEditorWrapper value={body} onChange={setBody} placeholder={"Write a comment..."} initialState={"simple"} short={true} />
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button style={{ fontSize: "1rem" }} onClick={handleSubmit} disabled={loading}>{editId ? "Update" : "Post"}</button>
            {editId ? <button style={{ fontSize: "1rem" }} onClick={onCancel}>Cancel</button> : null}
        </div>
    </div>;
}

function Comment({ comment, targetType, targetId, buildOwnerId, pinned, onPost, onEdit, onDelete, onPin }) {
    const [replying, setReplying] = useState(false);
    const [editing, setEditing] = useState(false);
    const [pinLoading, setPinLoading] = useState(false);
    const { user } = useAuth();
    const { openDeleteCommentModal } = useModal();

    async function handleDelete() {
        onDelete(comment.id);
        if (pinned) onPin(null);
    }

    async function handlePin() {
        setPinLoading(true);
        if (targetType === "build") {
            if (await (pinBuildComment(targetId, comment.id))) onPin(comment);
        } else if (targetType === "collection") {
            if (await (pinCollectionComment(targetId, comment.id))) onPin(comment);
        } else if (targetType === "md_plan") {
            if (await (pinMdPlanComment(targetId, comment.id))) onPin(comment);
        }
        setPinLoading(false);
    }

    async function handleUnpin() {
        setPinLoading(true);
        if (targetType === "build") {
            if (await (unpinBuildComment(targetId))) onPin(null);
        } else if (targetType === "collection") {
            if (await (unpinCollectionComment(targetId))) onPin(null);
        } else if (targetType === "md_plan") {
            if (await (unpinMdPlanComment(targetId))) onPin(null);
        }
        setPinLoading(false);
    }

    return (
        <div style={{ border: "1px #777 solid", borderRadius: "1rem", padding: "0.8rem 1rem 0.2rem 1rem" }}>
            {comment.parent_body && (
                <div style={{ paddingBottom: "0.25rem" }}>
                    {comment.parent_deleted ?
                        <div style={{ display: "flex", flexDirection: "column", textAlign: "start", gap: "0.25rem" }}>
                            <span style={{ fontSize: "0.8rem" }}>Replying to</span>
                            <div style={{ border: "1px #777 solid", borderRadius: "0.5rem", padding: "0.5rem", color: "#777" }}>
                                <em>Comment deleted</em>
                            </div>
                        </div> :
                        <div style={{ display: "flex", flexDirection: "column", textAlign: "start", gap: "0.25rem" }}>
                            <span style={{ fontSize: "0.8rem" }}>Replying to <Username username={comment.parent_author} flair={comment.parent_flair} /></span>
                            <div style={{ border: "1px #777 solid", borderRadius: "0.5rem", padding: "0.25rem", paddingLeft: "0.5rem" }}>
                                <MarkdownRenderer content={comment.parent_body} />
                            </div>
                        </div>}
                </div>
            )}

            {editing ?
                <CommentInput targetType={targetType} targetId={targetId} initialValue={comment.body} parentId={comment.parent_id}
                    editId={comment.id} onEdit={(body) => { setEditing(false); onEdit(comment.id, body); }} onCancel={() => setEditing(false)} /> :
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <div style={{ fontSize: "0.8rem" }}><UsernameWithTime data={comment} scale={.8} includeUpdatedAt={false} /> {comment.edited ? `(edited)` : null}</div>
                    <MarkdownRenderer content={comment.body} />

                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        {user ? <button onClick={() => setReplying(r => !r)}>↩ Reply</button> : null}
                        {user?.id === comment.user_id && <>
                            <button onClick={() => setEditing(true)}>✎ Edit</button>
                            <button onClick={() => openDeleteCommentModal
                                ({ targetType: targetType, commentId: comment.id, commentBody: comment.body, onDelete: handleDelete })
                            }>🗑 Delete</button>
                        </>
                        }
                        {user?.id === buildOwnerId ? (
                            pinned ?
                                <button onClick={handleUnpin} disabled={pinLoading}>📌 Unpin</button> :
                                <button onClick={handlePin} disabled={pinLoading}>📌 Pin</button>
                        ) : null}
                    </div>

                    {replying && (
                        <CommentInput
                            targetType={targetType}
                            targetId={targetId}
                            parentId={comment.id}
                            onPost={(newComment) => {
                                setReplying(false);
                                onPost({ ...newComment, parent_author: comment.username, parent_flair: comment.user_flair, parent_body: comment.body, parent_deleted: false });
                            }}
                        />
                    )}
                </div>
            }
        </div>
    );
}

export default function CommentSection({ targetType, targetId, ownerId, commentCount, pinnedComment = null }) {
    const [comments, setComments] = useState([]);
    const [pinned, setPinned] = useState(pinnedComment);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const { user, profile } = useAuth();

    useEffect(() => {
        const loadComments = async () => {
            setLoading(true);
            const comments = await getComments(targetType, targetId, page);
            setComments(comments);
            setLoading(false);
        }

        loadComments();
    }, [targetType, targetId, page]);

    const onPost = (comment) => { setComments(p => [{ ...comment, username: profile.username, flair: profile.flair }, ...p]) };
    const onEdit = (id, body) => setComments(p => p.map(c => c.id === id ? { ...c, body: body, edited: true } : c));
    const onDelete = id => setComments(p => p.filter(c => c.id !== id));
    const onPin = (comment) => setPinned(comment);

    return <section style={{ display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Comments{commentCount ? ` (${commentCount})` : null}</h3>

        {pinned ? <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", paddingBottom: "1rem" }}>
            <span style={{ fontWeight: "bold", paddingLeft: "1rem" }}>📌 Pinned Comment</span>
            <Comment comment={pinned} targetType={targetType} targetId={targetId} buildOwnerId={ownerId} pinned={true} onPost={onPost} onEdit={onEdit} onDelete={onDelete} onPin={onPin} />
        </div> : null}

        {user ?
            <CommentInput targetType={targetType} targetId={targetId} onPost={onPost} /> :
            <div style={{ color: "#aaa", fontWeight: "bold", textAlign: "center" }}>Login to create comments</div>
        }

        <div style={{ height: "0.5rem" }} />

        {loading ?
            <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading...</p> :
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {comments.length === 0 ?
                    <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                        {page === 1 ? "No comments yet." : "No more comments."}
                    </p> :
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {comments.map((c, i) => <Comment key={i} comment={c} targetType={targetType} targetId={targetId} buildOwnerId={ownerId} onPost={onPost} onEdit={onEdit} onDelete={onDelete} onPin={onPin} />)}
                    </div>
                }

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", alignSelf: "end" }}>
                    <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                    {/* {commentCount !== undefined ? 
                        [-2, -1, 0, 1, 2].filter(x => page + x > 0 && page + x <= Math.ceil(commentCount / 20)).map(x =>
                            <button key={x} className="page-button" disabled={x === 0} onClick={() => setPage(page + x)}>{page + x}</button>
                        ) :
                        page
                    } */}
                    {page}
                    <button className="page-button" disabled={comments.length < 20} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            </div>
        }
    </section>
}