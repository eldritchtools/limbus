"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import styles from "./UserStatus.module.css";
import Avatar from "../icons/Avatar";
import NoPrefetchLink from "../NoPrefetchLink";
import { HorizontalDivider } from "../objects/Dividers";
import Follow from "../objects/Follow";
import Notification from "../objects/Notification";

import { useAuth } from "@/app/database/authProvider";
import { getNotificationBellData } from "@/app/database/notifications";
import { uiColors } from "@/app/lib/colors";
import useLocalState from "@/app/lib/useLocalState";

let lastFetchTime = 0;
let inFlight = null;

const REFRESH_MS = 5 * 60 * 1000;

async function fetchNotifications(userId, setNotifs, setUnreadNotifsCount, setFollows, setUnreadFollowsCount) {
    const now = Date.now();
    if (now - lastFetchTime < REFRESH_MS) return;
    if (inFlight) return inFlight;

    inFlight = (async () => {
        try {
            const { notifications, unread_notifications_count, following, unread_following_count } = await getNotificationBellData(userId);

            setNotifs(notifications);
            setUnreadNotifsCount(unread_notifications_count);
            setFollows(following);
            setUnreadFollowsCount(unread_following_count);

            lastFetchTime = Date.now();
        } finally {
            inFlight = null;
        }
    })();

    return inFlight;
}

function UserStatus() {
    const { user, profile, loading, logout } = useAuth();
    const router = useRouter();
    const [notifs, setNotifs] = useState([]);
    const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
    const [follows, setFollows] = useState([]);
    const [unreadFollowsCount, setUnreadFollowsCount] = useState(0);
    const [tab, setTab] = useLocalState("notificationsTab", "notif");
    const [notifsOpen, setNotifsOpen] = useState(false);
    const popoverRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setNotifsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const updateNotif = (notif) => {
        const unread = !notifs.find(n => n.id === notif.id).is_read;
        setNotifs(p => p.map(n => n.id === notif.id ? notif : n));
        if (unread) setUnreadNotifsCount(p => p - 1);
    }

    const updateFollow = (follow) => {
        const unread = follows.find(f => f.target_type === follow.target_type && f.target_id === follow.target_id).unread_count > 0;
        setFollows(p => p.map(f => f.target_type === follow.target_type && f.target_id === follow.target_id ? follow : f));
        if (unread) setUnreadFollowsCount(p => p - 1);
    }

    useEffect(() => {
        if (!user) return;

        fetchNotifications(user.id, setNotifs, setUnreadNotifsCount, setFollows, setUnreadFollowsCount);

        const onVisible = () => {
            if (document.visibilityState === "visible") {
                fetchNotifications(user.id, setNotifs, setUnreadNotifsCount, setFollows, setUnreadFollowsCount);
            }
        };

        document.addEventListener("visibilitychange", onVisible);

        const interval = setInterval(() => {
            fetchNotifications(user.id, setNotifs, setUnreadNotifsCount, setFollows, setUnreadFollowsCount);
        }, 5 * 60 * 1000);

        return () => {
            document.removeEventListener("visibilitychange", onVisible);
            clearInterval(interval);
        };
    }, [user]);

    return loading ?
        <div style={{ padding: "0.5rem", paddingLeft: "1rem", borderBottom: "1px var(--secondary-border-color) solid", fontSize: "0.875rem" }}>
            Loading user status...
        </div> :
        <div style={{ padding: "0.5rem", paddingLeft: "1rem", borderBottom: "1px var(--secondary-border-color) solid", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <Avatar avatarId={profile?.avatar_id} size={32} style={{ display: "inline" }} />
                    <span style={{ overflowWrap: "break-word", wordWrap: "break-word", maxWidth: profile?.avatar_id ? "185px" : "215px" }}>
                        {`Welcome, ${profile ? profile.username : "Guest"}!`}
                    </span>
                </div>
                {user ?
                    <div style={{ display: "flex", alignItems: "end" }}>
                        <button onClick={() => logout()} className={styles.logInOut} style={{ flex: 1 }}>Logout</button>
                        <div style={{ position: "relative" }} ref={popoverRef}>
                            <button onClick={() => setNotifsOpen(p => !p)} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}>
                                🔔
                                {unreadNotifsCount + unreadFollowsCount > 0 ? <span style={{ position: "absolute", "top": "-5px", right: "-5px", background: uiColors.red, color: "#ddd", fontWeight: "bold", borderRadius: "50%", fontSize: ".75rem", padding: "2px 5px" }}>
                                    {unreadNotifsCount + unreadFollowsCount}
                                </span> : null}
                            </button>
                            {notifsOpen ?
                                <div style={{
                                    position: "absolute", right: 0, top: "110%", width: "200px", background: "var(--bg-input)",
                                    color: "var(--primary-text-color)", border: "1px solid #var(--primary-border-color)",
                                    borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: "50",
                                    display: "flex", flexDirection: "column", padding: "0.5rem"
                                }}>
                                    <div style={{ display: "flex", paddingBottom: "0.2rem", gap: "0.5rem", justifyContent: "center" }}>
                                        <div
                                            className={`tab-header ${tab === "notif" ? "active" : ""}`}
                                            style={{ fontSize: "0.8rem", fontWeight: "normal", textAlign: "center" }}
                                            onClick={() => setTab("notif")}
                                        >
                                            Notifications{unreadNotifsCount > 0 ? ` (${unreadNotifsCount})` : null}
                                        </div>
                                        <div
                                            className={`tab-header ${tab === "follow" ? "active" : ""}`}
                                            style={{ fontSize: "0.8rem", fontWeight: "normal", textAlign: "center" }}
                                            onClick={() => setTab("follow")}
                                        >
                                            Followed Threads{unreadFollowsCount > 0 ? ` (${unreadFollowsCount})` : null}
                                        </div>
                                    </div>
                                    <HorizontalDivider />
                                    <div style={{ maxHeight: "300px", overflowY: "auto", overflowX: "hidden", padding: "10px", boxSizing: "border-box" }}>
                                        {tab === "notif" ?
                                            (notifs.length === 0 ?
                                                <div style={{ textAlign: "center", padding: "15px", color: "var(--secondary-text-color)" }}>No notifications</div> :
                                                notifs.map(notif => <Notification key={notif.id} notif={notif} updateNotif={updateNotif} />)
                                            ) :
                                            (follows.length === 0 ?
                                                <div style={{ textAlign: "center", padding: "15px", color: "var(--secondary-text-color)" }}>No followed threads</div> :
                                                follows.map(follow => <Follow key={follow.target_id} follow={follow} updateFollow={updateFollow} />)
                                            )
                                        }
                                    </div>
                                    <div style={{ borderTop: "1px solid #444", padding: "8px", textAlign: "center" }}>
                                        <NoPrefetchLink href="/notifications" style={{ color: "#4da3ff", textDecoration: "none", fontSize: "0.9rem" }}>View all notifications</NoPrefetchLink>
                                    </div>
                                </div> : null}
                        </div>
                    </div> :
                    <button onClick={() => router.push("/login")} className={styles.logInOut}>Login</button>
                }
            </div>
        </div>

}

export default UserStatus;
