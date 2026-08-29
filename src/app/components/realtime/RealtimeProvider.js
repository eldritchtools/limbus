import { Socket } from "phoenix";
import { useCallback, useMemo, useRef, useState } from "react";
import { createContext, useContext } from "react";

import { extractRoomPrefix, trimPrefixes } from "./realtimeUtil";
import useRealtimeChatApi from "./useRealtimeChatApi";
import useRealtimeClashBattleApi from "./useRealtimeClashBattleApi";
import useRealtimeQuizApi from "./useRealtimeQuizApi";

import { triggerRoomJoinGAEvent } from "@/app/lib/gaEvents";

const RealtimeContext = createContext();

export default function RealtimeProvider({ children }) {
    const [status, setStatus] = useState("connecting");
    const socketRef = useRef(null);
    const roomsRef = useRef(new Map());
    const [roomIds, setRoomIds] = useState([]);
    const connectPromiseRef = useRef(null);

    const getSocket = useCallback(async () => {
        if (socketRef.current) return socketRef.current;
        const socket = new Socket(`${process.env.NEXT_PUBLIC_REALTIME_URL}/socket`);

        connectPromiseRef.current = new Promise((resolve, reject) => {
            socket.onOpen(() => {
                setStatus("connected");
                resolve(socket);
            });

            socket.onError(() => {
                socket.disconnect();
                socketRef.current = null;
                setStatus("disconnected");
                reject(new Error("realtime_unavailable"));
            });

            socket.onClose(() => {
                setStatus("disconnected");
                connectPromiseRef.current = null;
                socketRef.current = null;
            });

            socket.connect();
        });

        socketRef.current = socket;
        return connectPromiseRef.current;
    }, []);

    const getRoom = useCallback(async (roomId, { nameFn, autoJoinChat, displayName } = {}) => {
        let room = roomsRef.current.get(roomId);
        if (room) return room;

        const socket = await getSocket();
        const roomChannel = socket.channel(`room:${roomId}`);
        let actualRoomId;

        try {
            actualRoomId = await new Promise((resolve, reject) => {
                roomChannel
                    .join()
                    .receive("ok", ({ room_id }) => {
                        triggerRoomJoinGAEvent(extractRoomPrefix(room_id));
                        resolve(room_id);
                    })
                    .receive("error", reject)
                    .receive("timeout", () => reject(new Error("timeout")));
            });
        } catch (err) {
            roomChannel.leave();
            setRoomIds(p => p.filter(x => x !== roomId));
            throw err;
        }

        room = {
            id: actualRoomId,
            name: nameFn ? nameFn(trimPrefixes(actualRoomId)) : trimPrefixes(actualRoomId),
            socket: roomChannel.socket,
            roomChannel,
            autoJoinChat,
            displayName,
            components: {}
        };

        roomsRef.current.set(actualRoomId, room);
        setRoomIds(p => p.includes(actualRoomId) ? p : [...p, actualRoomId]);

        return room;
    }, [getSocket]);

    const leaveRoom = useCallback(roomId => {
        const room = roomsRef.current.get(roomId);
        if (!room) return;
        
        roomsRef.current.delete(roomId);
        setRoomIds(p => p.filter(x => x !== roomId));

        Object.values(room.components).forEach(component => {
            component.channel.leave();
        });

        room.roomChannel?.leave();
    },
        [roomsRef]
    );

    const checkLeaveRoom = useCallback(roomId => {
        const room = roomsRef.current.get(roomId);
        if (!room) return;

        // if (Object.keys(room.components).length === 0) {
        //     leaveRoom(roomId);
        // }
    },
        [roomsRef]
    );

    const getRoomData = useCallback(roomId => {
        if (roomsRef.current.has(roomId))
            return { ...roomsRef.current.get(roomId) };
        else
            return null;
    }, [roomsRef]);

    const chat = useRealtimeChatApi({ getRoom, checkLeaveRoom });
    const quiz = useRealtimeQuizApi({ getRoom, checkLeaveRoom });
    const clashBattle = useRealtimeClashBattleApi({ getRoom, checkLeaveRoom });

    const value = useMemo(() => ({
        status,
        room: {
            join: getRoom,
            leave: leaveRoom,
            roomIds,
            getRoomData: getRoomData
        },
        chat,
        quiz,
        clashBattle
    }),
        [status, getRoom, leaveRoom, roomIds, getRoomData, chat, quiz, clashBattle]
    );

    return <RealtimeContext.Provider value={value}>
        {children}
    </RealtimeContext.Provider>;
}


export function useRealtime() {
    const realtime = useContext(RealtimeContext);

    if (!realtime) {
        throw new Error(
            "useRealtime must be used inside RealtimeProvider"
        );
    }

    return realtime;
}
