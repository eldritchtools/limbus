import { useCallback, useMemo } from "react";

import useRealtimeComponentApi from "./useRealtimeComponentApi";

export default function useRealtimeQuizApi({ getRoom, checkLeaveRoom }) {
    const { mountComponent, unmountComponent, push } =
        useRealtimeComponentApi({ component: "quiz", getRoom, checkLeaveRoom });

    const mount = useCallback(async (roomId, { displayName, clientId, settings, handlers }) => {
        await mountComponent(roomId, {
            channel: `quiz:${roomId}`,
            params: { display_name: displayName, client_id: clientId, settings },
            events: ["state", "joined", "left", "settings", "question", "answer_count", "submission"],
            handlers
        })
    }, [mountComponent]);
    
    const unmount = useCallback(async (roomId, subscriber) => {
        unmountComponent(roomId, subscriber);
    },
        [unmountComponent]
    );

    const changeSettings = useCallback(async (roomId, settings) => {
        return push(roomId, "change_settings", { settings });
    },
        [push]
    );

    const startGame = useCallback(async (roomId, question, answer) => {
        return push(roomId, "start_game", { question, answer });
    },
        [push]
    );

    const submitAnswer = useCallback(async (roomId, answer) => {
        return push(roomId, "submit_answer", { answer });
    },
        [push]
    );

    const endRound = useCallback(async (roomId) => {
        return push(roomId, "end_round", {});
    },
        [push]
    );

    const nextRound = useCallback(async (roomId, question, answer) => {
        return push(roomId, "next_round", { question, answer });
    },
        [push]
    );

    const endGame = useCallback(async (roomId) => {
        return push(roomId, "end_game", {});
    },
        [push]
    );

    const returnToSetup = useCallback(async (roomId) => {
        return push(roomId, "return_to_setup", {});
    },
        [push]
    );

    return useMemo(() =>
        ({ mount, unmount, changeSettings, startGame, submitAnswer, endRound, nextRound, endGame, returnToSetup }),
        [mount, unmount, changeSettings, startGame, submitAnswer, endRound, nextRound, endGame, returnToSetup]
    );
}