import IdentityIcon from "../components/icons/IdentityIcon"

export default function DraftCompleteScreen({ clashBattle }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>

        <span style={{ fontSize: "1.25rem" }}>Final Draft</span>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${clashBattle.participants.length}, 128px)`, gap: "0.5rem" }}>
            {clashBattle.participants.map(x =>
                <span key={`${x.player_id}-label`} style={{ wordWrap: "break-word", overflowWrap: "break-word", textAlign: "center" }}>
                    {x.display_name}
                </span>
            )}
            {clashBattle.participants.map(x =>
                <div key={`${x.player_id}-ids`} style={{ display: "flex", flexDirection: "column", width: "128px" }}>
                    {x.identities.map(id => <IdentityIcon key={id} id={id} displayName={true} displayRarity={true} />)}
                </div>
            )}
        </div>

        {
            clashBattle.isHost ?
                <span className="text-link" onClick={() => { }}
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
