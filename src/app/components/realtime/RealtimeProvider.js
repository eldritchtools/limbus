import { Socket } from "phoenix";
import { useCallback, useMemo, useRef, useState } from "react";
import { createContext, useContext } from "react";

import useRealtimeChatApi from "./useRealtimeChatApi";

const RealtimeContext = createContext();

export default function RealtimeProvider({ children }) {
    const [status, setStatus] = useState("connecting");
    const socketRef = useRef(null);
    const roomsRef = useRef(new Map());
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

    const getRoom = useCallback(async roomId => {
        let room = roomsRef.current.get(roomId);
        if (room) return room;

        const socket = await getSocket();
        const roomChannel = socket.channel(`room:${roomId}`);

        try {
            await new Promise((resolve, reject) => {
                roomChannel
                    .join()
                    .receive("ok", resolve)
                    .receive("error", reject)
                    .receive("timeout", () => reject(new Error("timeout")));
            });
        } catch (err) {
            roomChannel.leave();
            throw err;
        }

        room = {
            socket: roomChannel.socket,
            roomChannel,
            components: {}
        };

        roomsRef.current.set(roomId, room);
        return room;
    }, [getSocket]);

    const leaveRoom = useCallback(roomId => {
        const room = roomsRef.current.get(roomId);
        if (!room) return;

        Object.values(room.components).forEach(component => {
            component.channel.leave();
        });

        room.roomChannel?.leave();
        roomsRef.current.delete(roomId);
    },
        [roomsRef]
    );

    const checkLeaveRoom = useCallback(roomId => {
        const room = roomsRef.current.get(roomId);
        if (!room) return;

        if (Object.keys(room.components).length === 0) {
            leaveRoom(roomId);
        }
    },
        [roomsRef, leaveRoom]
    );

    const chat = useRealtimeChatApi({ getRoom, checkLeaveRoom });

    const value = useMemo(() => ({
        status,
        room: {
            join: getRoom,
            leave: leaveRoom
        },
        chat
    }),
        [status, getRoom, leaveRoom, chat]
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
