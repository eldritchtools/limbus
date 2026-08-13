"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useEffect, useState } from "react";

import { useEgosWithUpcoming, useIdentitiesWithUpcoming } from "../dataHooks/upcoming";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";
import MarkdownEditorWrapper from "../markdown/MarkdownEditorWrapper";
import MarkdownRenderer from "../markdown/MarkdownRenderer";
import { EgoDropdownSelector } from "../selectors/EgoSelectors";
import { IdentityDropdownSelector } from "../selectors/IdentitySelectors";

import { uiColors } from "@/app/lib/colors";
import { sinnerIdMapping } from "@/app/lib/constants";

export function AlternativeOptionsModalEditableContent({ buildRef, index }) {
    const [identities, identitiesLoading] = useIdentitiesWithUpcoming();
    const [egos, egosLoading] = useEgosWithUpcoming();
    const [altOptions, setAltOptions] = useState([]);
    const [tick, setTick] = useState(1);
    const { isMobile } = useBreakpoint();

    const identityOptions = useMemo(() =>
        identitiesLoading ? [] :
            Object.entries(identities)
                .filter(([, v]) => v.sinnerId === index + 1)
                .map(([k]) => k),
        [index, identities, identitiesLoading]
    );

    const egoOptions = useMemo(() =>
        egosLoading ? [] :
            Object.entries(egos)
                .filter(([, v]) => v.sinnerId === index + 1)
                .map(([k]) => k),
        [index, egos, egosLoading]
    );

    useEffect(() => {
        setAltOptions(buildRef.current.altOptions[index]);
    }, [tick, buildRef, index]);

    const identityOptionsFinal = useMemo(() =>
        identityOptions.filter(x => !altOptions.some(({ id }) => id === x)),
        [identityOptions, altOptions]
    );

    const egoOptionsFinal = useMemo(() =>
        egoOptions.filter(x => !altOptions.some(({ id }) => id === x)),
        [egoOptions, altOptions]
    );

    return <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
        minHeight: "450px", maxHeight: "80vh", minWidth: "300px", maxWidth: "min(800px, 90vw)"
    }}>
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Alternative options for {sinnerIdMapping[index + 1]}</h2>

        {!identitiesLoading &&
            <IdentityDropdownSelector
                selected={null}
                setSelected={v => { buildRef.current.addAltOption(index, v); setTick(p => p + 1) }}
                options={identityOptionsFinal}
            />
        }
        {!egosLoading &&
            <EgoDropdownSelector
                selected={null}
                setSelected={v => { buildRef.current.addAltOption(index, v); setTick(p => p + 1) }}
                options={egoOptionsFinal}
            />
        }

        <div style={{
            display: "grid", gridTemplateColumns: isMobile ? "1fr" : "auto 1fr",
            alignItems: "center", gap: "0.2rem", padding: "0.5rem", overflowY: "auto"
        }}>
            {altOptions.map(({ id, desc }) => <React.Fragment key={id}>
                <div style={{ display: "flex", gap: "0.2rem", alignItems: "center", justifyContent: "center" }}>
                    <button onClick={() => { buildRef.current.removeAltOption(index, id); setTick(p => p + 1) }}>
                        <div style={{ color: uiColors.red, fontWeight: "bold" }}>
                            ✕
                        </div>
                    </button>
                    {
                        String(id)[0] === '1' ?
                            <IdentityIcon id={id} displayName={true} displayRarity={true} size={isMobile ? 92 : 128} /> :
                            <EgoIcon id={id} type={"awaken"} displayName={true} displayRarity={true} size={isMobile ? 92 : 128} />
                    }
                </div>
                <div style={{ maxWidth: "80vw" }}>
                    <MarkdownEditorWrapper
                        value={desc}
                        onChange={v => { buildRef.current.setAltOptionDesc(index, id, v); setTick(p => p + 1) }}
                        placeholder={"Details for this option..."}
                        mini={true} short={true}
                    />
                </div>
            </React.Fragment>)}
        </div>
    </div>
}

export function AlternativeOptionsModalContent({ altOptions, sinnerId }) {
    const { isMobile } = useBreakpoint();

    return <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
        minHeight: "450px", maxHeight: "80vh", minWidth: "300px", maxWidth: "min(800px, 90vw)"
    }}>
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Alternative options for {sinnerIdMapping[sinnerId]}</h2>

        <div style={{
            display: "grid", gridTemplateColumns: isMobile ? "1fr" : "auto 1fr",
            alignItems: "center", gap: "0.2rem", padding: "0.5rem", overflowY: "auto"
        }}>
            {altOptions.map(({ id, desc }) => <React.Fragment key={id}>
                <div style={{ display: "flex", gap: "0.2rem", alignItems: "center", justifyContent: "center" }}>
                    {
                        String(id)[0] === '1' ?
                            <IdentityIcon id={id} displayName={true} displayRarity={true} size={isMobile ? 92 : 128} /> :
                            <EgoIcon id={id} type={"awaken"} displayName={true} displayRarity={true} size={isMobile ? 92 : 128} />
                    }
                </div>
                <div style={{ maxWidth: "80vw" }}>
                    <MarkdownRenderer content={desc} />
                </div>
            </React.Fragment>)}
        </div>
    </div>
}
