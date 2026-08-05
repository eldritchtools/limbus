import { useCallback, useMemo } from "react";

import useRealtimeComponentApi from "./useRealtimeComponentApi";

export default function useRealtimeChatApi({ getRoom, checkLeaveRoom }) {
    const { mountComponent, unmountComponent, push } =
        useRealtimeComponentApi({ component: "chat", getRoom, checkLeaveRoom });

    const mount = useCallback(async (roomId, { displayName, clientId, handlers }) => {
        return await mountComponent(roomId, {
            channel: `chat:${roomId}`,
            params: { display_name: displayName, client_id: clientId },
            events: ["history", "message", "system"],
            handlers
        })
    }, [mountComponent]);

    const unmount = useCallback(async (roomId, subscriber) => {
        await unmountComponent(roomId, subscriber);
    },
        [unmountComponent]
    );

    const sendMessage = useCallback(async (roomId, text) => {
        await push(roomId, "send_message", { text });
    },
        [push]
    );

    return useMemo(() =>
        ({ mount, unmount, sendMessage }),
        [mount, unmount, sendMessage]
    );
}