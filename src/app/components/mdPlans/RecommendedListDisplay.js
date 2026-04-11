"use client";

import { useEgosWithUpcoming, useIdentitiesWithUpcoming } from "../dataHooks/upcoming";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";
import AllIdEgoSelector from "../selectors/AllIdEgoSelector";

export default function RecommendedListDisplay({ identityIds, setIdentityIds, egoIds, setEgoIds, editable = false }) {
    const [identities, identitiesLoading] = useIdentitiesWithUpcoming(true);
    const [egos, egosLoading] = useEgosWithUpcoming(true);

    const handleSetIdentityId = id => {
        if(identityIds.includes(id)) setIdentityIds(p => p.filter(x => x !== id))
        else setIdentityIds(p => [...p, id]);
    }

    const handleSetEgoId = id => {
        if(egoIds.includes(id)) setEgoIds(p => p.filter(x => x !== id))
        else setEgoIds(p => [...p, id]);
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {identityIds.length > 0 ?
            <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                <div style={{ display: "flex", flexShrink: 0, gap: "0.5rem", padding: "0.2rem", border: "1px transparent solid", borderRadius: "1rem" }}>
                    {identityIds.map(id =>
                        <div key={id} style={{ width: "128px", flexShrink: 0 }} data-tooltip-id="identity-tooltip" data-tooltip-content={id}>
                            <IdentityIcon id={id} uptie={4} displayName={true} displayRarity={true} />
                        </div>
                    )}
                </div>
            </div> :
            null
        }
        {egoIds.length > 0 ?
            <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                <div style={{ display: "flex", flexShrink: 0, gap: "0.5rem", padding: "0.2rem", border: "1px transparent solid", borderRadius: "1rem" }}>
                    {egoIds.map(id =>
                        <div key={id} style={{ width: "128px", flexShrink: 0 }} data-tooltip-id="ego-tooltip" data-tooltip-content={id}>
                            <EgoIcon id={id} type={"awaken"} displayName={true} displayRarity={true} />
                        </div>
                    )}
                </div>
            </div> :
            null
        }

        {editable && !identitiesLoading && !egosLoading ? 
            <AllIdEgoSelector
                identityIds={identityIds}
                egoIds={egoIds}
                setIdentityId={handleSetIdentityId}
                setEgoId={handleSetEgoId}
                identityOptions={identities}
                egoOptions={egos}
                includeSelectedFirst={true}
            /> :
            null
        }
    </div>
}