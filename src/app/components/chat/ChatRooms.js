import styles from "./ChatWidget.module.css";

export default function ChatRooms({ rooms, activeRoomId, onSelect }) {
    return <div className={styles.roomList}>
        {Object.values(rooms).map(room => (
            <button key={room.id} className={styles.roomEntry} onClick={() => onSelect(room.id)}>
                <div>{room.name} ({room.userCount} online)</div>

                {room.unread > 0 && <>
                    <span className={`${styles.roomIndicator} ${styles.entry}`} />
                    <div className={styles.unreadBadge}>
                        {room.unread > 99 ? "99+" : room.unread}
                    </div>
                    </>
                }
            </button>
        ))}
    </div>;
}
