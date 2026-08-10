import { useCallback, useMemo, useRef } from "react";

export default function useRealtimeComponentApi({ component, getRoom, checkLeaveRoom }) {
    const nextId = useRef(1);

    const registerConsumer = useCallback((componentState, handlers) => {
        const id = nextId.current++;
        componentState.consumers.set(id, { handlers });
        return id;
    }, []);

    const mountComponent = useCallback(async (roomId, { channel, params, events, handlers }) => {
        let room;
        try {
            room = await getRoom(roomId);
        } catch (err) {
            handlers.disconnected?.();
            throw err;
        }

        let componentState = room.components[component];

        if (componentState) return registerConsumer(componentState, handlers);

        const channelObj = room.socket.channel(channel, params);

        componentState = {
            channel: channelObj,
            consumers: new Map()
        };

        room.components[component] = componentState;

        events.forEach(event => {
            channelObj.on(event, payload => {
                for (const consumer of componentState.consumers.values()) {
                    consumer.handlers[event]?.(payload);
                }
            });
        })

        channelObj.onClose(() => {
            for (const consumer of componentState.consumers.values()) {
                consumer.handlers.disconnected?.();
            }
        })

        channelObj.onError(() => {
            for (const consumer of componentState.consumers.values()) {
                consumer.handlers.disconnected?.();
            }
        })

        try {
            await new Promise((resolve, reject) => {
                channelObj.join()
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
            delete room.components[component];
            throw err;
        }

        return registerConsumer(componentState, handlers);
    },
        [component, getRoom, registerConsumer]
    );

    const unmountComponent = useCallback(async (roomId, subscriber) => {
        const room = await getRoom(roomId);
        const componentState = room.components[component];
        if (!componentState) return;

        componentState.consumers.delete(subscriber);
        if (componentState.consumers.size === 0) {
            await componentState.channel.leave();
            delete room.components[component];
            checkLeaveRoom(roomId)
        }
    },
        [component, getRoom, checkLeaveRoom]
    );

    const push = useCallback(async (roomId, event, payload) => {
        const room = await getRoom(roomId);
        const channel = room.components[component].channel;

        return new Promise((resolve, reject) => {
            channel
                .push(event, payload)
                .receive("ok", () => {
                    resolve();
                })
                .receive("error", err => {
                    reject(err);
                })
                .receive("timeout", () => reject(new Error("timeout")));
        });
    }, [component, getRoom]);

    return useMemo(() =>
        ({ mountComponent, unmountComponent, push }),
        [mountComponent, unmountComponent, push]
    );
}