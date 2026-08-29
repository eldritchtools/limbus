import ParticipantGrid from "./ParticipantsDisplay"
import IdentityIcon from "../components/icons/IdentityIcon"

export default function DraftCompleteScreen({ clashBattle }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Final Draft</span>
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

        {
            clashBattle.isHost ?
                <span className="text-link" onClick={() => clashBattle.startGame()}
                    style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
                >
                    Start Game
                </span> :
                <span>
                    Waiting for host to start.
                </span>
        }
    </div>
}
