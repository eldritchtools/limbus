import { useCallback, useMemo, useRef } from "react";

export default function useRealtimeChatApi({ getRoom, checkLeaveRoom }) {
    const nextId = useRef(1);

    const registerConsumer = useCallback((chatState, handlers) => {
        const id = nextId.current++;
        chatState.consumers.set(id, { handlers });
        return id;
    }, []);

    const mount = useCallback(async (roomId, { displayName, clientId, handlers }) => {
        const room = await getRoom(roomId);
        let chat = room.components.chat;

        if (chat) return registerConsumer(chat, handlers);

        const channel = room.socket.channel(`chat:${roomId}`, { display_name: displayName, client_id: clientId });

        chat = {
            channel,
            consumers: new Map()
        };

        room.components.chat = chat;

        channel.on("history", payload => {
            for (const consumer of chat.consumers.values()) {
                consumer.handlers.history?.(payload);
            }
        });

        channel.on("message", payload => {
            for (const consumer of chat.consumers.values()) {
                consumer.handlers.message?.(payload);
            }
        });

        channel.on("system", payload => {
            for (const consumer of chat.consumers.values()) {
                consumer.handlers.system?.(payload);
            }
        });

        channel.onClose(() => {
            for (const consumer of chat.consumers.values()) {
                consumer.handlers.disconnected?.();
            }
        })

        channel.onError(() => {
            for (const consumer of chat.consumers.values()) {
                consumer.handlers.disconnected?.();
            }
        })

        try {
            await new Promise((resolve, reject) => {
                channel.join()
                    .receive("ok", () => {
                        handlers.connected?.();
                        resolve();
                    })
                    .receive("error", err => {
                        handlers.disconnected?.();
                        reject(err);
                    });
            });
        } catch (err) {
            delete room.components.chat;
            throw err;
        }

        return registerConsumer(chat, handlers);
    },
        [getRoom, registerConsumer]
    );

    const unmount = useCallback(async (roomId, subscriber) => {
        const room = await getRoom(roomId);
        const chat = room.components.chat;
        if (!chat) return;

        chat.consumers.delete(subscriber);
        if (chat.consumers.size === 0) {
            await chat.channel.leave();
            delete room.components.chat;
            checkLeaveRoom(roomId)
        }
    },
        [getRoom, checkLeaveRoom]
    );

    const sendMessage = useCallback(async (roomId, text) => {
        const room = await getRoom(roomId);
        const chat = room.components.chat;

        return new Promise((resolve, reject) => {
            chat.channel
                .push("send_message", { text })
                .receive("ok", () => {
                    resolve();
                })
                .receive("error", err => {
                    reject(err);
                })
                .receive("timeout", () => reject(new Error("timeout")));
        });
    },
        [getRoom]
    );

    return useMemo(() =>
        ({ mount, unmount, sendMessage }),
        [mount, unmount, sendMessage]
    );
}