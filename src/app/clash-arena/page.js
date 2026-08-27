"use client";

import DraftCompleteScreen from "./DraftCompleteScreen";
import DraftScreen from "./DraftScreen";
import RoomSetupScreen from "./RoomSetupScreen";
import SetupScreen from "./SetupScreen";
import { useClashBattle } from "./useClashBattle";
import { useAuth } from "../database/authProvider";

export default function ClashArenaPage() {
    const {profile} = useAuth();
    const clashBattle = useClashBattle();

    if (clashBattle.phase === "roomSetup")
        return <RoomSetupScreen clashBattle={clashBattle} profile={profile} />

    if (clashBattle.phase === "setup")
        return <SetupScreen clashBattle={clashBattle} />

    if (clashBattle.phase === "draft")
        return <DraftScreen clashBattle={clashBattle} />

    if (clashBattle.phase === "draftComplete")
        return <DraftCompleteScreen clashBattle={clashBattle} />
}
