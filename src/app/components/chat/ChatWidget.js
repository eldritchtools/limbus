import { useEffect, useRef, useState } from "react";

import ChatButton from "./ChatButton";
import ChatEntries from "./ChatEntries";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatRooms from "./ChatRooms";
import styles from "./ChatWidget.module.css";
import { useRealtime } from "../realtime/RealtimeProvider";
import useRealtimeClientId from "../realtime/useRealtimeClientId";
import { useSiteCustomization } from "../SiteCustomizationProvider";
import ChatSettings from "./ChatSettings";

import useLocalState from "@/app/lib/useLocalState";

const GLOBAL_CHAT_ID = "global:lobby";

export const CHAT_WIDGET_VIEWS = {
    CHAT: "chat",
    ROOMS: "rooms",
    SETTINGS: "settings"
}

function appendEntry(type, entries, newEntry, nextEntryIdRef) {
    if (type === "message") {
        const lastMessage = entries.findLast(x => x.type === "message");
        if (!lastMessage || lastMessage.participantId !== newEntry.participant_id) {
            entries.push({
                type: "author",
                id: `author:${newEntry.id}`,
                displayName: newEntry.display_name,
                timestamp: newEntry.sent_at
            })
        }

        entries.push({
            type: "message",
            id: newEntry.id,
            text: newEntry.text,
            participantId: newEntry.participant_id
        })
    }

    if (type === "system") {
    }
}

export default function ChatWidget({ username }) {
    const { chat } = useRealtime();
    const { getCustomizationValue } = useSiteCustomization();
    const [view, setView] = useState(CHAT_WIDGET_VIEWS.CHAT);
    const [expanded, setExpanded] = useState(false);
    const [activeRoomId, setActiveRoomId] = useState(GLOBAL_CHAT_ID);
    const [displayName, setDisplayName] = useLocalState("chatDisplayName", username ?? "Guest");
    const [unavailable, setUnavailable] = useState(false);
    const clientId = useRealtimeClientId();

    const viewRef = useRef(view);
    const expandedRef = useRef(expanded);
    const activeRoomIdRef = useRef(activeRoomId);
    const nextEntryIdRef = useRef(1);

    useEffect(() => {
        viewRef.current = view;
    }, [view]);

    useEffect(() => {
        expandedRef.current = expanded;
    }, [expanded]);

    useEffect(() => {
        activeRoomIdRef.current = activeRoomId;
    }, [activeRoomId]);

    const [rooms, setRooms] = useState({
        [GLOBAL_CHAT_ID]: {
            id: GLOBAL_CHAT_ID,
            name: "Global Chat",
            status: "disconnected",
            unread: 0,
            subscriberId: null,
            entries: [],
            userCount: 0
        }
    });

    function updateRoom(roomId, updater) {
        setRooms(previous => {
            const room = {
                ...(previous[roomId] ?? {
                    id: roomId,
                    name: "",
                    subscriberId: null,
                    status: "disconnected",
                    unread: 0,
                    entries: [],
                    userCount: 0
                })
            };

            updater(room);

            return { ...previous, [roomId]: room };
        });
    }

    const [presenceNotifs, setPresenceNotifs] = useState([]);

    function addPresenceNotification(displayName, type) {
        const id = nextEntryIdRef.current++;

        setPresenceNotifs(list => [
            ...list,
            { id, text: `${displayName} ${type}` }
        ]);

        setTimeout(() => {
            setPresenceNotifs(list => list.filter(n => n.id !== id));
        }, 1500);
    }

    useEffect(() => {
        if (unavailable) return;

        if (getCustomizationValue("autoConnectGlobalChat")) {
            joinChat(GLOBAL_CHAT_ID);
        }

        const fetchCount = async () => {
            if (rooms[GLOBAL_CHAT_ID].status !== "disconnected") return;

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_REALTIME_API_URL}/api/presence`);
                if (!res.ok) return;
                const json = await res.json();
                if (json.error) return;

                updateRoom(GLOBAL_CHAT_ID, room => {
                    room.userCount = json.rooms[GLOBAL_CHAT_ID]
                });
            } catch (err) {
                setUnavailable(true);
            }
        }

        fetchCount();
        const id = setInterval(fetchCount, 300000);

        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function joinChat(roomId) {
        let subscriberId;

        if (displayName.trim().length === 0) return;

        updateRoom(roomId, room => {
            room.status = "connecting";
        })

        try {
            subscriberId = await chat.mount(roomId, {
                displayName,
                clientId,
                handlers: {
                    history: payload => {
                        updateRoom(roomId, room => {
                            room.entries = [];
                            payload.history.forEach(x => appendEntry("message", room.entries, x));
                            room.userCount = payload.user_count;
                        });
                    },

                    message: message => {
                        updateRoom(roomId, room => {
                            room.entries = [...room.entries];
                            appendEntry("message", room.entries, message);

                            if (!expandedRef.current || activeRoomIdRef.current !== roomId || viewRef.current !== "chat")
                                room.unread++;
                        });
                    },

                    presence: message => {
                        updateRoom(roomId, room => {
                            room.userCount = message.user_count;
                        });

                        if (roomId !== activeRoomId) return;
                        addPresenceNotification(message.display_name, message.type);
                    },

                    system: message => {
                        updateRoom(roomId, room => {
                            room.entries = [...room.entries];
                            appendEntry("system", room.entries, message, nextEntryIdRef);
                        });
                    },

                    connected: () => {
                        updateRoom(roomId, room => {
                            room.status = "connected";
                        });
                        setUnavailable(false);
                    },

                    disconnected: () => {
                        updateRoom(roomId, room => {
                            room.status = "disconnected";
                        })
                    }
                }
            });
        } catch (err) {
            updateRoom(roomId, room => {
                room.status = "disconnected";
            })

            setUnavailable(true);
        }

        updateRoom(roomId, room => {
            room.subscriberId = subscriberId;
            room.unread = 0;
        });

        setActiveRoomId(roomId);
    }

    async function leaveChat(roomId) {
        const room = rooms[roomId];
        if (room?.status !== "connected") return;

        await chat.unmount(roomId, room.subscriberId);

        if (roomId === GLOBAL_CHAT_ID) {
            updateRoom(roomId, room => {
                room.status = "disconnected";
                room.subscriberId = null;
                room.unread = 0;
                room.entries = [];
                room.userCount = room.userCount - 1;
            });
        } else {
            setRooms(previous => {
                const { [roomId]: room, ...rest } = previous;
                return rest;
            });

            setActiveRoomId(Object.keys(rooms).at(-1));
        }
    }

    function resetRoomUnread(roomId) {
        updateRoom(roomId, room => {
            room.unread = 0;
        });
    }

    function switchRoom(roomId) {
        setActiveRoomId(roomId);
        resetRoomUnread(roomId);
    }

    const activeRoom = rooms[activeRoomId];

    if (!expanded)
        return <ChatButton
            onExpand={() => {
                setExpanded(true);
                setView(CHAT_WIDGET_VIEWS.CHAT);
                if (activeRoomId) resetRoomUnread(activeRoomId);
            }}
            rooms={rooms}
            activeRoom={activeRoom}
            unavailable={unavailable}
        />

    return <div className={styles.widget}>
        <ChatHeader
            view={view} rooms={rooms} activeRoom={activeRoom}
            onShowRooms={() => setView(CHAT_WIDGET_VIEWS.ROOMS)}
            onShowChat={() => { setView(CHAT_WIDGET_VIEWS.CHAT); resetRoomUnread(activeRoomId); }}
            onShowSettings={() => setView(CHAT_WIDGET_VIEWS.SETTINGS)}
            onCollapse={() => setExpanded(false)}
            onLeaveChat={() => leaveChat(activeRoomId)}
        />

        {view === CHAT_WIDGET_VIEWS.CHAT && (
            activeRoom.status === "connected" ?
                <>
                    <ChatEntries
                        entries={rooms[activeRoomId].entries}
                        presenceNotifications={presenceNotifs}
                    />
                    <ChatInput
                        disabled={activeRoom.status !== "connected"}
                        sendMessage={async text => await chat.sendMessage(activeRoomId, text)}
                    />
                </> :
                <WelcomeView displayName={displayName} setDisplayName={setDisplayName} roomId={activeRoomId} room={activeRoom} joinChat={joinChat} unavailable={unavailable} />
        )}

        {view === CHAT_WIDGET_VIEWS.ROOMS && (
            <ChatRooms rooms={rooms} activeRoomId={activeRoomId} onSelect={roomId => { switchRoom(roomId); setView(CHAT_WIDGET_VIEWS.CHAT); }} />
        )}

        {view === CHAT_WIDGET_VIEWS.SETTINGS && (
            <ChatSettings />
        )}
    </div>
}

function WelcomeView({ displayName, setDisplayName, roomId, room, joinChat, unavailable }) {
    return <>
        {roomId === GLOBAL_CHAT_ID ? <>
            <p style={{ margin: 0, textAlign: "center" }}>Welcome to Global Chat!</p>

            <p style={{ margin: 0 }}>
                This is a public chat room for anyone currently active on the site to ask for help or opinions or just to hang out.
            </p>

            <p style={{ margin: 0 }}>
                This is an opt-in feature, which means you will not be connected to the chat room unless you allow it.
            </p>

            <p style={{ margin: 0 }}>
                Global Chat Rules:
            </p>

            <ol style={{ margin: 0 }}>
                <li>Be respectful.</li>
                <li>Avoid spoilers.</li>
                <li>Keep things relevant to Limbus.</li>
                <li>No spam.</li>
            </ol>
        </> : <>
            <p style={{ margin: 0, textAlign: "center" }}>Welcome to {room.name}!</p>

            <p style={{ margin: 0 }}>
                Join this room&apos;s chat to talk with other participants.
            </p>
        </>}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <span>Display Name:</span>
            <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Display name"
                onKeyDown={e => {
                    if (room.status === "disconnected" && e.key === 'Enter' && displayName.trim().length > 0) joinChat(roomId)
                }}
            />
        </div>

        <button onClick={() => joinChat(roomId)} disabled={displayName.trim().length === 0 || room.status === "connecting"} >
            {room.status === "connecting" ?
                "Connecting..." :
                "Join Chat"
            }
        </button>

        {unavailable && <span style={{ textAlign: "center" }}>Chat is temporarily unavailable.<br />Please try again later.</span>}
    </>;
}
