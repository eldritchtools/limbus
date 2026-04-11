"use client";

import { isTouchDevice } from "@eldritchtools/shared-components";

import TooltipTemplate from "./TooltipTemplate";
import { useData } from "../DataProvider";
import IdentityIcon from "../icons/IdentityIcon";
import KeywordIcon from "../icons/KeywordIcon";
import NoPrefetchLink from "../NoPrefetchLink";

const TOOLTIP_ID = "identity-tooltip";

function IdentityTooltipContent({ identity }) {
    return <div style={{display: "flex", flexDirection: "column"}}>
        <div style={{ display: "flex", flexDirection: "row", padding: "0.5rem", gap: "0.5rem", height: "128px" }}>
            <div>
                <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} style={{width: "128px", height: "128px"}} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", width: "192px" }}>
                <div style={{ flex: 1, display: "flex" }}>
                    {(identity.skillKeywordList || []).map(x => <KeywordIcon key={x} id={x} />)}
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                    {identity.affinities.map(x => <KeywordIcon key={x} id={x} />)}
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                    {identity.types.map(x => <KeywordIcon key={x} id={x} />)}
                </div>
            </div>
        </div>
        {isTouchDevice() ? <NoPrefetchLink href={`/identities/${identity.id}`} style={{alignSelf: "center", fontSize: "1.2rem"}}>Go to page</NoPrefetchLink> : null}
    </div>
}

function TooltipLoader({ id }) {
    const [identities, identitiesLoading] = useData("identities_mini");
    if (!id || identitiesLoading || !(id in identities)) return null;

    return <IdentityTooltipContent identity={identities[id]} />
}

export default function IdentityTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID} contentFunc={id => <TooltipLoader id={id} />} clickable={isTouchDevice()}/>
}

export function getIdentityTooltipProps(id) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": id
    }
}