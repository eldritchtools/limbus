"use client";

import { useRouter } from "next/navigation";
import ReactTimeAgo from "react-time-ago";

import styles from "./Notification.module.css";

import { setNotificationRead } from "@/app/database/notifications";

function constructActorStr(actors) {
    if (actors.length >= 4) return `${actors[0]}, ${actors[1]}, and ${actors.length - 2} more users`;
    if (actors.length === 3) return `${actors[0]}, ${actors[1]}, and 1 more user`;
    if (actors.length === 2) return `${actors[0]} and ${actors[1]}`
    return `${actors[0]}`;
}

const targetTypeMapping = {
    "build": "build",
    "collection": "collection",
    "md_plan": "md plan"
}

const eventString = {
    "comment": "commented on your",
    "reply": "replied to your comment to the",
    "collection_submission": "made a submission to your",
    "collection_submission_approved": "approved your submission to the",
    "collection_submission_rejected": "rejected your submission to the",
}

function constructNotifMessage(notif) {
    const actorsStr = constructActorStr(notif.actors);

    return `${actorsStr} ${eventString[notif.type]} ${targetTypeMapping[notif.target_type]} ${notif.title}`
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
            default:
                return
        }
    }

    return <div onClick={() => handleNotifClick(notif)} className={notif.is_read ? styles.notifRead : styles.notif}>
        <div style={{ fontSize: "1rem", marginBottom: "4px" }} onClick={() => handleNotifClick(notif)}>
            {constructNotifMessage(notif)}
        </div>
        <div style={{ fontSize: "0.8rem", color: "#999" }}>
            <ReactTimeAgo date={notif.created_at} locale="en-US" timeStyle="mini" />
        </div>
    </div>
}