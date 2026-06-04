"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactTimeAgo from "react-time-ago";

import styles from "./Notification.module.css";

import { fetchEncounter } from "@/app/database/encounters";
import { setNotificationRead } from "@/app/database/notifications";
import { commentsTargetIdsReversed } from "@/app/lib/commentsTargetIds";
import metadataIndex from "@/data/metadata_index.json";

function constructActorStr(actors) {
    if (actors.length >= 4) return `${actors[0]}, ${actors[1]}, and ${actors.length - 2} more users`;
    if (actors.length === 3) return `${actors[0]}, ${actors[1]}, and 1 more user`;
    if (actors.length === 2) return `${actors[0]} and ${actors[1]}`
    return `${actors[0]}`;
}

const targetTypeMapping = {
    "build": "build",
    "collection": "collection",
    "md_plan": "md plan",
    "encounter": "encounter"
}

const eventString = {
    "comment": "commented on your",
    "reply": "replied to your comment on the",
    "collection_submission": "made a submission to your",
    "collection_submission_approved": "approved your submission to the",
    "collection_submission_rejected": "rejected your submission to the",
    "new_post": "has posted a new"
}

function constructNotifMessage(notif) {
    const actorsStr = constructActorStr(notif.actors);

    if (notif.target_type === "fixed")
        return `${actorsStr} ${eventString[notif.type]} ${commentsTargetIdsReversed[notif.target_id]} page`;

    if (notif.target_type === "encounter") {
        const [cat, enc] = notif.title.split("|");
        const name = metadataIndex?.encounters?.[cat]?.[enc] ?? "";
        return `${actorsStr} ${eventString[notif.type]} ${targetTypeMapping[notif.target_type]} ${name}`;
    }

    return `${actorsStr} ${eventString[notif.type]} ${targetTypeMapping[notif.target_type]} ${notif.title}`;
}

export default function Notification({ notif, updateNotif }) {
    const router = useRouter();

    const handleNotifClick = async (notif) => {
        await setNotificationRead(notif.id);
        if (updateNotif && !notif.is_read) updateNotif({ ...notif, is_read: true });
        switch (notif.target_type) {
            case "build":
                router.push(`/builds/${notif.target_id}`);
                return;
            case "collection":
                router.push(`/collections/${notif.target_id}`);
                return;
            case "md_plan":
                router.push(`/md-plans/${notif.target_id}`);
                return;
            case "fixed":
                switch (commentsTargetIdsReversed[notif.target_id]) {
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
                const [category, encounter] = notif.title.split("|");
                const params = new URLSearchParams();
                params.set("category", category);
                params.set("encounter", encounter);

                router.push(`/encounters?${params.toString()}`);
                return;
            default:
                return;
        }
    }

    return <div onClick={() => handleNotifClick(notif)} className={notif.is_read ? styles.notifRead : styles.notif}>
        <div style={{ fontSize: "1rem", marginBottom: "4px" }} onClick={() => handleNotifClick(notif)}>
            {constructNotifMessage(notif)}
        </div>
        <div className="sub-text">
            <ReactTimeAgo date={notif.created_at} locale="en-US" timeStyle="mini" />
        </div>
    </div>
}