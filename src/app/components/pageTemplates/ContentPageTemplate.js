"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import CommentSection from "./CommentSection";
import DeleteButton from "../contentActions/DeleteButton";
import EditButton from "../contentActions/EditButton";
import LikeButton from "../contentActions/LikeButton";
import SaveButton from "../contentActions/SaveButton";
import { ViewSolid } from "../contentActions/Symbols";
import Tag from "../objects/Tag";
import SocialsDisplay from "../user/SocialsDisplay";
import UsernameWithTime from "../user/UsernameWithTime";

import { useAuth } from "@/app/database/authProvider";
import { isLocalId } from "@/app/database/localDB";

export function LoadingContentPageTemplate() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
        Loading...
    </div>
}

export default function ContentPageTemplate({ targetType, targetId, content, titleIcons, sideComponent, actions = [], children }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!content && pathname && searchParams) {
            const hash = window.location.hash?.substring(1);
            if (!hash) return;

            const el = document.getElementById(hash);
            if (el) {
                setTimeout(() => {
                    const y = el.getBoundingClientRect().top + window.pageYOffset - 48;
                    window.scrollTo({ top: y, behavior: 'smooth' })
                }, 200);
            }
        }
    }, [content, pathname, searchParams]);

    useEffect(() => {
        if (content) document.title = `${content.title} | Limbus Company Tools`;
    }, [content]);

    const constructAction = (action) => {
        if (action === "like") return <LikeButton key={"like"} targetType={targetType} targetId={targetId} likeCount={content.likeCount} />;
        if (action === "save") return <SaveButton key={"save"} targetType={targetType} targetId={targetId} />;
        if (action === "edit")
            return (user && user.id === content.user_id) || isLocalId(targetId) ?
                <EditButton key={"edit"} targetType={targetType} targetId={targetId} /> :
                null
        if (action === "delete")
            return (user && user.id === content.user_id) || isLocalId(targetId) ?
                <DeleteButton key={"delete"} targetType={targetType} targetId={targetId} title={content.title} /> :
                null
    }

    if (!content)
        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
            Loading...
        </div>

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", containerType: "inline-size" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                {titleIcons}
                {content.title}
            </h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "#ddd" }}>
                    <UsernameWithTime data={content} scale={.9} />
                </div>
                {sideComponent}
            </div>
        </div>

        {children}

        <div style={{ border: "1px #777 solid" }} />

        <div style={{ display: "flex", flexDirection: "column", paddingLeft: "0.5rem", width: "100%", gap: "0.5rem" }}>
            {content.tags?.length > 0 ?
                <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    Tags: {content.tags.map((t, i) => <Tag key={i} tag={t.name ?? t} type={targetType} />)}
                </div> :
                null
            }
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
                {actions.map(x => constructAction(x))}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
                {user && user.id === content.user_id ?
                    <div>
                        <ViewSolid text={`${content.view_count !== null ? content.view_count.toLocaleString() : "-"} views`} />
                    </div>
                    : null
                }
            </div>
            {content.user_socials?.length > 0 ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.25rem" }}>
                    <span>Connect with {content.username}:</span>
                    <SocialsDisplay socials={content.user_socials} expandDirection="column" align="start" />
                </div> :
                null
            }
        </div>

        <div style={{ border: "1px #777 solid" }} />

        {content.is_published ?
            <div id="comments" style={{ width: "clamp(300px, 100%, 1200px)", alignSelf: "center" }}>
                <CommentSection targetType={targetType} targetId={targetId} ownerId={content.user_id} commentCount={content.commentCount} pinnedComment={content.pinned_comment} />
            </div> :
            <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>No comments while not published.</p>
        }
    </div>
}