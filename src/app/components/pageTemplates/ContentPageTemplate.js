"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import CommentSection from "./CommentSection";
import ContributeButton from "../contentActions/ContributeButton";
import DeleteButton from "../contentActions/DeleteButton";
import EditButton from "../contentActions/EditButton";
import LikeButton from "../contentActions/LikeButton";
import ReviewButton from "../contentActions/ReviewButton";
import SaveButton from "../contentActions/SaveButton";
import ShareButton from "../contentActions/ShareButton";
import { BackSolid, ViewSolid } from "../contentActions/Symbols";
import KeywordIcon from "../icons/KeywordIcon";
import StatusIcon from "../icons/StatusIcon";
import { HorizontalDivider } from "../objects/Dividers";
import Tag from "../objects/Tag";
import SocialsDisplay from "../user/SocialsDisplay";
import UsernameWithTime from "../user/UsernameWithTime";

import { useAuth } from "@/app/database/authProvider";
import { keywordIdMapping } from "@/app/database/keywordIds";
import { isLocalId } from "@/app/database/localDB";
import { contentConfig } from "@/app/lib/contentConfig";


export function LoadingContentPageTemplate() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
        Loading...
    </div>
}

export default function ContentPageTemplate({ targetType, targetId, content, titleIcons, keywordIcons, addedIcons, sideComponent, actions = [], children }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

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

    // useEffect(() => {
    //     if (content) document.title = `${content.title} | Limbus Company Tools`;
    // }, [content]);

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back()
        } else {
            router.push(`/${contentConfig[targetType].path}`)
        }
    }

    const constructAction = (action) => {
        if (action === "like") return <LikeButton key={"like"} targetType={targetType} targetId={targetId} likeCount={content.like_count} />;
        if (action === "save") return <SaveButton key={"save"} targetType={targetType} targetId={targetId} />;
        if (action === "edit")
            return (user && user.id === content.user_id) || isLocalId(targetId) ?
                <EditButton key={"edit"} targetType={targetType} targetId={targetId} /> :
                null
        if (action === "share") return <ShareButton key={"share"} targetType={targetType} targetId={targetId} title={content.title} />;
        if (action === "delete")
            return (user && user.id === content.user_id) || isLocalId(targetId) ?
                <DeleteButton key={"delete"} targetType={targetType} targetId={targetId} title={content.title} /> :
                null

        // For collections only
        if (action === "contribute" && targetType === "collection")
            return content.submission_mode === "open" ? <ContributeButton key={"contribute"} collectionId={targetId} /> : null;

        if (action === "review" && targetType === "collection")
            return user && user.id === content.user_id ? <ReviewButton key={"review"} collectionId={targetId} /> : null;
    }

    if (!content)
        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
            Loading...
        </div>

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", containerType: "inline-size" }}>
        <div>
            <button onClick={handleBack} className="text-link" style={{ background: "transparent", border: "none", padding: "0" }}>
                <BackSolid text={"Go Back"} />
            </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center", flexWrap: "wrap", marginTop: 0, marginBottom: "0.5rem" }}>
                {titleIcons}
                {(keywordIcons ?? []).map(id => <KeywordIcon key={id} id={keywordIdMapping[id]} />)}
                {(addedIcons ?? []).map(id => <StatusIcon key={id} id={id} style={{ width: "32px" }} />)}
                {content.title}
            </h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "var(--primary-text-color)" }}>
                    <UsernameWithTime data={content} scale={0.9} avatarId={content.user_avatar_id} withFollowButton={true} />
                </div>
                {sideComponent}
            </div>
        </div>

        {children}

        <HorizontalDivider />

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

        <HorizontalDivider />

        {content.is_published ?
            <div id="comments" style={{ width: "clamp(300px, 100%, 1200px)", alignSelf: "center" }}>
                <CommentSection targetType={targetType} targetId={targetId} ownerId={content.user_id} commentCount={content.comment_count} pinnedComment={content.pinned_comment} />
            </div> :
            <p style={{ color: "var(--secondary-text-color)", fontweight: "bold", textAlign: "center" }}>No comments while not published.</p>
        }
    </div>
}