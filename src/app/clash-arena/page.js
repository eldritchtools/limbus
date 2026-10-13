"use client";

import DraftCompleteScreen from "./DraftCompleteScreen";
import DraftScreen from "./DraftScreen";
import FinishedScreen from "./FinishedScreen";
import ModeSelectScreen from "./ModeSelectScreen";
import RoomSetupScreen from "./RoomSetupScreen";
import RoundRevealScreen from "./RoundRevealScreen";
import RoundSelectScreen from "./RoundSelectScreen";
import SetupScreen from "./SetupScreen";
import { useClashBattle } from "./useClashBattle";
import NitroAd from "../components/ads/NitroAd";
import { useAuth } from "../database/authProvider";

function ClashArenaPageContent() {
    const { profile } = useAuth();
    const clashBattle = useClashBattle();

    if (clashBattle.phase === "modeSelect")
        return <ModeSelectScreen clashBattle={clashBattle} />

    if (clashBattle.phase === "roomSetup")
        return <RoomSetupScreen clashBattle={clashBattle} profile={profile} />

    if (clashBattle.phase === "setup")
        return <SetupScreen clashBattle={clashBattle} />

    if (clashBattle.phase === "draft")
        return <DraftScreen clashBattle={clashBattle} />

    if (clashBattle.phase === "draftComplete")
        return <DraftCompleteScreen clashBattle={clashBattle} />

    if (clashBattle.phase === "roundSelect")
        return <RoundSelectScreen clashBattle={clashBattle} />

    if (clashBattle.phase === "roundReveal")
        return <RoundRevealScreen clashBattle={clashBattle} />

    if (clashBattle.phase === "finished")
        return <FinishedScreen clashBattle={clashBattle} />
}

export default function ClashArenaPage() {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <NitroAd id={"minigame-top-ad"} height={90} adLevel={"min"} style={{ width: "100%" }} />
        <ClashArenaPageContent />
    </div>
}
