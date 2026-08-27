import { useMemo, useRef, useState } from "react";

import { defaultSettings, phaseConvert, settingsToClient, settingsToServer } from "./util";
import { useData } from "../components/DataProvider";
import { useRealtime } from "../components/realtime/RealtimeProvider";
import useRealtimeClientId from "../components/realtime/useRealtimeClientId";
import { useSiteCustomization } from "../components/SiteCustomizationProvider";
import { getLocalStore } from "../database/localDB";

import { triggerGameCompleteGAEvent, triggerGameStartGAEvent } from "@/app/lib/gaEvents";

export function useClashBattle() {
    const [clashingData, clashingDataLoading] = useData("clashing_data")
    const { room, clashBattle } = useRealtime();
    const { getCustomizationValue } = useSiteCustomization();
    const clientId = useRealtimeClientId();

    const [phase, setPhase] = useState("roomSetup");
    const [roomId, setRoomId] = useState(null);
    const [playerId, setPlayerId] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [settings, setSettings] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [draftOrder, setDraftOrder] = useState([]);
    const [draftIndex, setDraftIndex] = useState(0);

    const roomIdRef = useRef(null);

    const loading = useMemo(() => {
        return clashingDataLoading
    }, [clashingDataLoading]);

    async function joinRoom(isHost, displayName, roomId, setJoinMessage) {
        const roomCode = `clashBattle:${isHost ? "new" : roomId}`;

        try {
            let roomObj = await room.join(roomCode, {
                nameFn: id => `Clash Arena ${id}`,
                autoJoinChat: getCustomizationValue("autoConnectChat"),
                displayName: displayName,
            });

            const getInitialSettings = async () => {
                const init = {...defaultSettings, ...(await getLocalStore("clashBattle").get("main")).settings ?? {}};
                return Object.fromEntries(Object.entries(init).map(([k, v]) => [settingsToServer(k), v]))
            }

            await clashBattle.mount(roomObj.id, {
                displayName,
                clientId,
                settings: isHost ? (await getInitialSettings()) : null,
                handlers: {
                    connected: () => {
                        setRoomId(roomObj.id);
                        roomIdRef.current = roomObj.id;
                        setIsHost(isHost);
                    },

                    disconnected: () => {
                        setPhase("roomSetup");
                        setRoomId(null);
                        setIsHost(false);
                        room.leave(roomObj.id);
                        roomIdRef.current = null;
                    },

                    state: payload => {
                        setFields(payload)
                    },

                    joined: ({ display_name }) => {
                        setParticipants(p => ([...p, display_name]));
                    },

                    left: ({ display_name }) => {
                        setParticipants(p => {
                            const index = p.indexOf(display_name);
                            if (index !== -1) return [...p].toSpliced(index, 1);
                            else return p;
                        })
                    },

                    settings: ({ settings }) => {
                        const converted = Object.fromEntries(Object.entries(settings).map(([k, v]) => [settingsToClient(k), v]))
                        setSettings(p => ({ ...p, ...converted }));
                    },

                    draft_started: ({ player_id, draft_order, participants }) => {
                        triggerGameStartGAEvent("clashBattle", "multi")
                        setPhase("draft");
                        setPlayerId(player_id);
                        setDraftOrder(draft_order);
                        setDraftIndex(0);
                        setParticipants(participants);
                    },

                    draft_pick: ({ player_id, identity_id, draft_index, draft_order }) => {
                        setParticipants(p =>
                            p.map(x => x.player_id === player_id ? { ...x, identities: [...x.identities, identity_id] } : x)
                        )
                        setDraftOrder(draft_order);
                        setDraftIndex(draft_index);
                    }
                }
            });
        } catch (err) {
            if (isHost) setJoinMessage("Unable to create room.");
            else setJoinMessage("Unable to join room.")
        }
    }

    async function leaveRoom() {
        if (roomIdRef.current) {
            room.leave(roomIdRef.current);
            roomIdRef.current = null;
            setRoomId(null);
        }
    }

    function setSetting(key, value) {
        setSettings(p => ({ ...p, [key]: value }));
        clashBattle.changeSetting(roomIdRef.current, settingsToServer(key), value);
    }

    function resetSettings() {
        setSettings(defaultSettings);
        clashBattle.changeSettings(roomIdRef.current, defaultSettings);
    }

    async function startDraft() {
        if (!isHost) return;
        getLocalStore("clashBattle").save({ id: "main", settings: settings });
        clashBattle.startDraft(roomIdRef.current);
    }

    async function pickIdentity(identityId) {
        clashBattle.pickIdentity(roomIdRef.current, identityId)
    }

    function setFields(fields) {
        if ("phase" in fields) setPhase(phaseConvert(fields.phase));
        if ("playerId" in fields) setPlayerId(fields.playerId);
        if ("player_id" in fields) setPlayerId(fields.player_id);
        if ("isHost" in fields) setIsHost(fields.isHost);
        if ("is_host" in fields) setIsHost(fields.is_host);
        if ("settings" in fields) 
            setSettings(
                Object.fromEntries(Object.entries(fields.settings).map(([k, v]) => [settingsToClient(k), v]))
            );
        if ("participants" in fields) setParticipants(fields.participants);
        if ("draftOrder" in fields) setDraftOrder(fields.draftOrder);
        if ("draft_order" in fields) setDraftOrder(fields.draft_order);
        if ("draftIndex" in fields) setDraftIndex(fields.draftIndex);
        if ("draft_index" in fields) setDraftIndex(fields.draft_index);
    }

    function getSelectedIdentities() {
        return participants.reduce((acc, x) => {
            return acc.concat(x.identities);
        }, []);
    }

    return {
        clashingData, loading,
        phase, roomId, playerId, isHost, settings, participants, draftOrder, draftIndex,
        setFields, joinRoom, leaveRoom, setSetting, resetSettings, startDraft, pickIdentity,
        getSelectedIdentities
    };
}
