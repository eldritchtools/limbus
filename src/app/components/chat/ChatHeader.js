import { FiChevronLeft, FiChevronDown, FiSettings, FiMinus } from "react-icons/fi";

import { CHAT_WIDGET_VIEWS } from "./ChatWidget";
import styles from "./ChatWidget.module.css";

export default function ChatHeader({ view, rooms, activeRoom, onShowRooms, onShowChat, onShowSettings, onCollapse, onLeaveChat }) {
    const hasUnreadRooms = Object.values(rooms).some(x =>
        x.id !== activeRoom.id && x.unread > 0
    );

    return <div className={styles.header}>
        {
            view === CHAT_WIDGET_VIEWS.CHAT &&
            <button
                className={styles.roomButton}
                onClick={onShowRooms}
            >
                <span className={styles.roomArrow}>
                    <FiChevronDown />

                    {hasUnreadRooms && <span className={styles.roomIndicator} />}
                </span>
                <span>{activeRoom.name} ({activeRoom.userCount} online)</span>
            </button>
        }

        {
            view === CHAT_WIDGET_VIEWS.ROOMS &&
            <button
                className={styles.roomButton}
                onClick={onShowChat}
            >
                <FiChevronLeft />
                <span>Rooms</span>
            </button>
        }

        {
            view === CHAT_WIDGET_VIEWS.SETTINGS &&
            <button
                className={styles.roomButton}
                onClick={onShowChat}
            >
                <FiChevronLeft />
                <span>Settings</span>
            </button>
        }

        <div className={styles.headerActions}>
            {view === CHAT_WIDGET_VIEWS.CHAT && activeRoom.status === "connected" &&
                <button className={styles.headerButton} onClick={onLeaveChat}>
                    Leave
                </button>
            }

            <button className={styles.headerButton} onClick={() => {
                if (view === CHAT_WIDGET_VIEWS.SETTINGS) onShowChat();
                else onShowSettings()
            }}>
                <FiSettings />
            </button>

            <button className={styles.headerButton} onClick={onCollapse}>
                <FiMinus />
            </button>
        </div>
    </div>
}
