"use client";

import { useRouter } from "next/navigation";
import ReactTimeAgo from "react-time-ago";

import styles from "./Follow.module.css";

import { markThreadRead } from "@/app/database/threads";
import { commentsTargetIdsReversed } from "@/app/lib/commentsTargetIds";
import metadataIndex from "@/data/metadata_index.json";

function constructTargetTitle(follow) {
    switch (follow.target_type) {
        case "build": case "collection": case "md_plan":
            return follow.title;
        case "fixed":
            return commentsTargetIdsReversed[follow.target_id];
        case "encounter":
            const [cat, enc] = follow.title.split("|");
            return metadataIndex?.encounters?.[cat]?.[enc] ?? "";
        default:
            return "";
    }
}

function constructFollowMessage(follow) {
    return `${follow.unread_count} new comment${follow.unread_count !== 1 ? "s" : ""} in ${constructTargetTitle(follow)}.`
}

export default function Follow({ follow, updateFollow }) {
    const router = useRouter();

    const handleFollowClick = async (follow) => {
        await markThreadRead(follow.target_type, follow.target_id);
        if (updateFollow) updateFollow({ ...follow, unread_count: 0 });
        switch (follow.target_type) {
            case "build":
                router.push(`/builds/${follow.target_id}`);
                return;
            case "collection":
                router.push(`/collections/${follow.target_id}`);
                return;
            case "md_plan":
                router.push(`/md-plans/${follow.target_id}`);
                return;
            case "fixed":
                switch (commentsTargetIdsReversed[follow.target_id]) {
                    case "Daily Random Team":
                        router.push("/daily-random");
                        return;
                    case "Release History":
                        router.push("/release-history");
                        return;
                    default:
                        return;
                }
            case "encounter":
                const [category, encounter] = follow.title.split("|");
                const params = new URLSearchParams();
                params.set("category", category);
                params.set("encounter", encounter);

                router.push(`/encounters?${params.toString()}`);
                return;
            default:
                return
        }
    }

    return <div onClick={() => handleFollowClick(follow)} className={follow.unread_count === 0 ? styles.followRead : styles.follow}>
        <div style={{ fontSize: "1rem", marginBottom: "4px" }}>
            {constructFollowMessage(follow)}
        </div>
        <div className="sub-text">
            <ReactTimeAgo date={follow.last_comment_at} locale="en-US" timeStyle="mini" />
        </div>
    </div>
}