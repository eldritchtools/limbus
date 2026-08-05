import { useCallback, useMemo } from "react";

import useRealtimeComponentApi from "./useRealtimeComponentApi";

export default function useRealtimeQuizApi({ getRoom, checkLeaveRoom }) {
    const { mountComponent, unmountComponent, push } =
        useRealtimeComponentApi({ component: "quiz", getRoom, checkLeaveRoom });

    const mount = useCallback(async (roomId, { displayName, clientId, handlers }) => {
        mountComponent(roomId, {
            channel: `quiz:${roomId}`,
            params: { display_name: displayName, client_id: clientId },
            events: [],
            handlers
        })
    }, [mountComponent]);

    const unmount = useCallback(async (roomId, subscriber) => {
        unmountComponent(roomId, subscriber);
    },
        [unmountComponent]
    );

    // const sendMessage = useCallback(async (roomId, text) => {
    //     return push(roomId, "send_message", { text });
    // },
    //     [push]
    // );

    return useMemo(() =>
        ({ mount, unmount }),
        [mount, unmount]
    );
}