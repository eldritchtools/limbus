"use client";

import { useEffect, useState } from "react";

import Follow from "../components/objects/Follow";
import Notification from "../components/objects/Notification";
import { useAuth } from "../database/authProvider";
import { getNotifications } from "../database/notifications";
import { getUserFollowedThreads } from "../database/threads";

export default function NotificationsPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState("notif");
    const [notifs, setNotifs] = useState([]);
    const [follows, setFollows] = useState([]);

    useEffect(() => {
        if (!user) return;
        const fetchNotifs = async () => {
            const userNotifs = await getNotifications(user.id);
            setNotifs(userNotifs);
        }

        const fetchFollows = async () => {
            const userFollows = await getUserFollowedThreads(user.id);
            setFollows(userFollows);
        }

        if (tab === "notif") fetchNotifs();
        else if (tab === "follow") fetchFollows();
    }, [user, tab]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "column", width: "100%", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
            <div className={`tab-header ${tab === "notif" ? "active" : ""}`} onClick={() => setTab("notif")}>Notifications</div>
            <div className={`tab-header ${tab === "follow" ? "active" : ""}`} onClick={() => setTab("follow")}>Followed Threads</div>
        </div>
        <div className="panel-container" style={{ width: "min(100%, 1200px)" }}>
            {tab === "notif" ?
                (notifs.length === 0 ?
                    <div style={{ textAlign: "center", padding: "15px", color: "var(--secondary-text-color)" }}>No notifications</div> :
                    notifs.map(notif => <Notification key={notif.id} notif={notif} />)
                ) :
                (follows.length === 0 ?
                    <div style={{ textAlign: "center", padding: "15px", color: "var(--secondary-text-color)" }}>No followed threads</div> :
                    follows.map(follow => <Follow key={follow.target_id} follow={follow} />)
                )
            }
        </div>
    </div>
}