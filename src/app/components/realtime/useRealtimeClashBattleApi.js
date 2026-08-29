import { useCallback, useMemo } from "react";

import useRealtimeComponentApi from "./useRealtimeComponentApi";

export default function useRealtimeClashBattleApi({ getRoom, checkLeaveRoom }) {
    const { mountComponent, unmountComponent, push } =
        useRealtimeComponentApi({ component: "clashBattle", getRoom, checkLeaveRoom });

    const mount = useCallback(async (roomId, { displayName, clientId, settings, handlers }) => {
        await mountComponent(roomId, {
            channel: `clashBattle:${roomId}`,
            params: { display_name: displayName, client_id: clientId, settings },
            events: [
                "state", "joined", "left", "settings", 
                "draft_started", "draft_pick", 
                "round", "skill_chosen_count", "skill_selected", "round_reveal", 
                "finished"
            ],
            handlers
        })
    }, [mountComponent]);

    const unmount = useCallback(async (roomId, subscriber) => {
        unmountComponent(roomId, subscriber);
    },
        [unmountComponent]
    );

    const changeSetting = useCallback(async (roomId, key, value) => {
        return push(roomId, "change_setting", { settings: { [key]: value } });
    },
        [push]
    );

    const changeSettings = useCallback(async (roomId, settings) => {
        return push(roomId, "change_settings", { settings });
    },
        [push]
    );

    const startDraft = useCallback(async (roomId) => {
        return push(roomId, "start_draft", {});
    },
        [push]
    );

    const pickIdentity = useCallback(async (roomId, identityId) => {
        return push(roomId, "pick_identity", { identity_id: identityId });
    },
        [push]
    );

    const startGame = useCallback(async (roomId) => {
        return push(roomId, "start_game", {});
    },
        [push]
    );

    const selectSkill = useCallback(async (roomId, identityId, skill) => {
        return push(roomId, "select_skill", {identity_id: identityId, skill: skill});
    },
        [push]
    );

    const nextRound = useCallback(async (roomId) => {
        return push(roomId, "next_round", {});
    },
        [push]
    );

    const returnToSetup = useCallback(async (roomId) => {
        return push(roomId, "return_to_setup", {});
    },
        [push]
    );

    return useMemo(() =>
        ({ mount, unmount, changeSetting, changeSettings, startDraft, pickIdentity, startGame, selectSkill, nextRound, returnToSetup }),
        [mount, unmount, changeSetting, changeSettings, startDraft, pickIdentity, startGame, selectSkill, nextRound, returnToSetup]
    );
}