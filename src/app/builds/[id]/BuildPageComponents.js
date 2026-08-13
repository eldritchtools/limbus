"use client";

import { useEffect, useState } from "react";

import BuildPage from "./BuildPage";

import BuildDisplay from "@/app/components/build/BuildDisplay";
import BuildDisplayMenuCard from "@/app/components/build/BuildDisplayMenuCard";
import DisplayTypeButton from "@/app/components/build/DisplayTypeButton";
import Distribution from "@/app/components/build/Distribution";
import TeamCodeComponent from "@/app/components/build/TeamCodeComponent";
import DragContainer from "@/app/components/objects/DragContainer";
import { contentConfig } from "@/app/lib/contentConfig";
import useLocalState from "@/app/lib/useLocalState";

export function BuildPageLocalWrapper({ id }) {
    const [build, setBuild] = useState(null);

    useEffect(() => {
        if (build) return;

        const fetch = async () => {
            try {
                setBuild(await contentConfig.builds.local.get(Number(id)));
            } catch (e) {
                console.error("Unable to fetch build");
            }
        }

        fetch();
    }, [id, build]);

    return <BuildPage id={id} build={build} />
}

export function BuildDisplaySection({ build, teamCode }) {
    const [displayType, setDisplayType] = useLocalState("buildDisplayType", "names");

    return <>
        <BuildDisplay build={build} displayType={displayType} />
        <DragContainer style={{ alignSelf: "center", width: "max-content", maxWidth: "100%" }}>
            <div style={{ display: "flex", gap: ".5rem", width: "max-content" }}>
                <BuildDisplayMenuCard width={240}>
                    <div>Display Type</div>
                    <DisplayTypeButton value={displayType} setValue={setDisplayType} />
                    <span className="sub-text" style={{ textAlign: "center" }}>
                        Quickly view various details of selected identities and E.G.Os or change how the team is displayed.
                    </span>
                    <TeamCodeComponent teamCode={teamCode} />
                </BuildDisplayMenuCard>
                <Distribution build={build} />
            </div>
        </DragContainer>
    </>
}