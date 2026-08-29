import React from "react";

import ParticipantGrid from "./ParticipantsDisplay";
import IdentityIcon from "../components/icons/IdentityIcon"

export default function FinishedScreen({ clashBattle }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>

        <span className="sub-text" style={{ maxWidth: "1000px", textAlign: "center", marginBottom: "1rem" }}>
            The game has ended! Here are the final scores.
            <br /><br />
            Congratulations to the winner(s)!
        </span>

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Final Scores</span>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "0.5rem", width: "min(100%, 200px)" }}>
            <span>#</span>
            <span>Player</span>
            <span>Score</span>
            {clashBattle.participants
                .sort((a, b) => b.score - a.score)
                .map((x, i) => <React.Fragment key={x.player_id}>
                    <span>{i + 1}</span>
                    <span>{x.display_name}</span>
                    <span style={{ textAlign: "end" }}>{x.score}</span>
                </React.Fragment>)
            }
        </div>

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Teams</span>
        <ParticipantGrid participants={clashBattle.participants}>
            {x => {
                return <div key={x.player_id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ wordWrap: "break-word", overflowWrap: "break-word", textAlign: "center" }}>
                        {x.display_name}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", width: "128px" }}>
                        {x.identities.map(id => <IdentityIcon key={id} id={id} displayName={true} displayRarity={true} />)}
                    </div>
                </div>
            }}
        </ParticipantGrid>

        {clashBattle.isHost &&
            <div style={{ display: "flex", gap: "1rem" }}>
                <span className="text-link" onClick={clashBattle.returnToSetup}
                    style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
                >
                    Return to Setup
                </span>
            </div>
        }
    </div >
}
