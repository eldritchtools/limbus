"use client";

import { useEffect, useState } from "react";

import Notification from "../components/objects/Notification";
import { useAuth } from "../database/authProvider";
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
        <div className="panel-container" style={{ width: "min(100%, 1200px)" }}>
            {notifs.length === 0 ?
                <div style={{ textAlign: "center", padding: "15px", color: "var(--secondary-text-color)" }}>No notifications</div> :
                notifs.map(notif => <Notification key={notif.id} notif={notif} />)
            }
        </div>
    </div>
}