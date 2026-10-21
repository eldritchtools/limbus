"use client";

import useIdleSim from "./useIdleSim";

export default function IdleSimPage() {
    const idleSim = useIdleSim();

    return <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
        <span>{JSON.stringify(idleSim.state)}</span>
        <span>Loading: {idleSim.loaded}</span>
        <span>Saving: {idleSim.saving}</span>
        <span>Error: {idleSim.error}</span>
        <button onClick={() => idleSim.forceTick()}>Force tick</button>
        <button onClick={() => idleSim.resetGame()}>Reset Game</button>

    </div>
}