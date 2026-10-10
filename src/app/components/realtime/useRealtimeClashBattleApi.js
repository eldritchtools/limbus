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
                "state", "joined", "left", "settings", "public_status",
                "draft_started", "draft_pick", "blacklist_state", "blacklist_selected", "blacklist_resolved",
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

    const openToPublic = useCallback(async (roomId) => {
        return push(roomId, "open_to_public", {});
    },
        [push]
    );

    const closeToPublic = useCallback(async (roomId) => {
        return push(roomId, "close_to_public", {});
    },
        [push]
    );

    const startDraft = useCallback(async (roomId) => {
        return push(roomId, "start_draft", {});
    },
        [push]
    );

    const pickItem = useCallback(async (roomId, itemId) => {
        return push(roomId, "pick_item", { item_id: itemId });
    },
        [push]
    );

    const startGame = useCallback(async (roomId) => {
        return push(roomId, "start_game", {});
    },
        [push]
    );

    const selectSkill = useCallback(async (roomId, itemId, skill) => {
        return push(roomId, "select_skill", {item_id: itemId, skill: skill});
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
        ({ mount, unmount, changeSetting, changeSettings, openToPublic, closeToPublic, startDraft, pickItem, startGame, selectSkill, nextRound, returnToSetup }),
        [mount, unmount, changeSetting, changeSettings, openToPublic, closeToPublic, startDraft, pickItem, startGame, selectSkill, nextRound, returnToSetup]
    );
}