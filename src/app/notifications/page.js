"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../database/authProvider";
import Notification from "../components/objects/Notification";
import { getNotifications } from "../database/notifications";

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifs, setNotifs] = useState([]);

    useEffect(() => {
        if (!user) return;
        const fetchNotifs = async () => {
            const userNotifs = await getNotifications(user.id);
            setNotifs(userNotifs);
        }
        fetchNotifs();
    }, [user]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "column", width: "100%", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", minWidth: "600px", width: "60%", alignItems: "center", border: "1px #444 solid", padding: "0.5rem", boxSizing: "border-box" }}>
            {notifs.length === 0 ?
                <div style={{ textAlign: "center", padding: "15px", color: "#aaa" }}>No notifications</div> :
                notifs.map(notif => <Notification key={notif.id} notif={notif} />)
            }
        </div>
    </div>
}