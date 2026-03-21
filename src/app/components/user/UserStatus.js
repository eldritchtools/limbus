"use client";

import styles from "./UserStatus.module.css";
import { useAuth } from "@/app/database/authProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getNotifications, getUnreadNotificationsCount } from "@/app/database/notifications";
import Notification from "../objects/Notification";
import NoPrefetchLink from "../NoPrefetchLink";
import { getSupabase } from "@/app/database/connection";

function UserStatus() {
    const { user, profile, logout } = useAuth();
    const router = useRouter();
    const [notifs, setNotifs] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
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
        setNotifs(p => p.map(n => n.id === notif.id ? notif : n));
    }

    useEffect(() => {
        if (!user) return;

        const refreshNotifications = async () => {
            setNotifs(await getNotifications(user.id, 5));
            setUnreadCount(await getUnreadNotificationsCount(user.id));
        }

        refreshNotifications();

        const channel = getSupabase()
            .channel("notifications")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    refreshNotifications();
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user]);

    return <div style={{ padding: "0.5rem", paddingLeft: "1rem", borderBottom: "1px #444 solid", fontSize: "0.875rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            Welcome, {profile ? profile.username : "Guest"}!
            {user ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "end" }}>
                    <div style={{ position: "relative" }} ref={popoverRef}>
                        <button onClick={() => setNotifsOpen(p => !p)} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}>
                            🔔
                            {unreadCount > 0 ? <span style={{ position: "absolute", "top": "-5px", right: "-5px", background: "red", color: "#ddd", borderRadius: "50%", fontSize: ".75rem", padding: "2px 5px" }}>
                                {unreadCount}
                            </span> : null}
                        </button>
                        {notifsOpen ?
                            <div style={{ position: "absolute", right: 0, top: "110%", width: "200px", background: "#222", color: "#ddd", border: "1px solid #444", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: "50" }}>
                                <div style={{ maxHeight: "300px", overflowY: "auto", overflowX: "hidden", padding: "10px", boxSizing: "border-box" }}>
                                    {notifs.length === 0 ?
                                        <div style={{ textAlign: "center", padding: "15px", color: "#aaa" }}>No notifications</div> :
                                        notifs.map(notif => <Notification key={notif.id} notif={notif} updateNotif={updateNotif} />)
                                    }
                                </div>
                                <div style={{ borderTop: "1px solid #444", padding: "8px", textAlign: "center" }}>
                                    <NoPrefetchLink href="/notifications" style={{ color: "#4da3ff", textDecoration: "none", fontSize: "0.9rem" }}>View all notifications</NoPrefetchLink>
                                </div>
                            </div> : null}
                    </div>
                    <button onClick={() => logout()} className={styles.logInOut}>Logout</button>
                </div> :
                <button onClick={() => router.push("/login")} className={styles.logInOut}>Login</button>
            }
        </div>
    </div>

}

export default UserStatus;
