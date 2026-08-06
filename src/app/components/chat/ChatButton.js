import styles from "./ChatWidget.module.css";

export default function ChatButton({ onExpand, rooms, activeRoom, unavailable }) {
    const hasUnread = Object.values(rooms).some(room => room.unread > 0)

    return <div className={styles.button} onClick={onExpand}>
        {unavailable ?
            "Temporarily Unavailable" :
            <>
                {activeRoom.status === "connected" && <span className={styles.connectedDot} />}
                {activeRoom.name} ({activeRoom.userCount} online)

                {activeRoom.unread > 0 &&
                    <div className={styles.unreadBadge}>
                        {activeRoom.unread > 99 ? "99+" : activeRoom.unread}
                    </div>
                }

                {hasUnread && <span className={`${styles.roomIndicator} ${styles.button}`} />}
            </>
        }
    </div>
}