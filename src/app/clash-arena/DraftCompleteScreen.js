import ParticipantGrid, { ParticipantTextGrid } from "./ParticipantsDisplay"
import EgoIcon from "../components/icons/EgoIcon"
import IdentityIcon from "../components/icons/IdentityIcon"
import { getClashArenaDraftTooltipProps } from "../components/tooltips/ClashArenaDraftTooltip"

export default function DraftCompleteScreen({ clashBattle }) {
    const playerEgo = clashBattle.getPlayerEgo();

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Final Draft</span>
        {clashBattle.mode === "standard" ?
            <ParticipantGrid participants={clashBattle.participants}>
                {x => {
                    return <div key={x.player_id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ wordWrap: "break-word", overflowWrap: "break-word", textAlign: "center" }}>
                            {x.display_name}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", width: "128px" }}>
                            {x.identities.map(id => <IdentityIcon key={id} id={id} displayName={true} displayRarity={true} />)}
                        </div>
                        {x.ego &&
                            <EgoIcon key={x.ego} id={x.ego} type="awaken" displayName={true} displayRarity={true} />
                        }
                    </div>
                }}
            </ParticipantGrid> : <>
                <div style={{ display: "flex", padding: "0.5rem" }}>
                    {Object.keys(clashBattle.skillCounts).map(id =>
                        <IdentityIcon key={id} id={id} displayName={true} displayRarity={true} size={128} />
                    )}
                    {playerEgo &&
                        <EgoIcon key={playerEgo} id={playerEgo} type="awaken" displayName={true} displayRarity={true} size={128} />
                    }
                </div>
                <ParticipantTextGrid participants={clashBattle.participants}>
                    {x => {
                        return <div key={x.player_id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                            <span
                                style={{ wordWrap: "break-word", overflowWrap: "break-word", textAlign: "center" }}
                                {...getClashArenaDraftTooltipProps([...x.identities, x.ego])}
                            >
                                {x.display_name}
                            </span>
                        </div>
                    }}
                </ParticipantTextGrid>
            </>
        }

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
