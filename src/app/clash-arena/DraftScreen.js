import { useCallback, useState } from "react";

import IdentityIcon from "../components/icons/IdentityIcon"
import { IdentityDropdownSelector } from "../components/selectors/IdentitySelectors"
import { selectStyleVariable } from "../styles/selectStyle"

export default function DraftScreen({ clashBattle }) {
    const [identityId, setIdentityId] = useState(null);

    const handleConfirm = useCallback(() => {
        clashBattle.pickIdentity(identityId);
        setIdentityId(null);
    }, [clashBattle, identityId]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Next Drafts</span>
        <div style={{ display: "flex", gap: "1rem" }}>
            {clashBattle.draftOrder.map((id, i) =>
                <span key={`${id}-${i}`}>
                    {i === 0 ? "▶" : ""} {clashBattle.participants.find(x => x.player_id === id).display_name}
                </span>
            )}
        </div>

        {
            clashBattle.draftOrder[0] === clashBattle.playerId ?
                <>
                    <span>Choose an identity:</span>
                    <div style={{ width: "min(100%, 1000px)" }}>
                        <IdentityDropdownSelector
                            selected={identityId} setSelected={x => setIdentityId(x)} styles={selectStyleVariable}
                            options={Object.keys(clashBattle.clashingData)}
                            excludeOptions={clashBattle.getSelectedIdentities()}
                            autoFocus={true}
                        />
                    </div>
                    {identityId && <>
                        <span className="text-link" onClick={handleConfirm}
                            style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
                        >
                            Confirm choice
                        </span>
                    </>
                    }
                </> :
                <span>
                    {clashBattle.participants.find(x => x.player_id === clashBattle.draftOrder[0]).display_name} is choosing...
                </span>
        }

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Current Draft</span>
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
    </div >
}
