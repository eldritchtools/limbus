"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import EventRolls from "./EventRolls";
import BuildDisplay from "../build/BuildDisplay";
import BuildDisplayMenuCard from "../build/BuildDisplayMenuCard";
import DisplayTypeButton from "../build/DisplayTypeButton";
import Distribution from "../build/Distribution";
import TeamCodeComponent from "../build/TeamCodeComponent";
import TeamBuild from "../contentCards/TeamBuild";
import useBuildState from "../dataHooks/useBuildState";
import KeywordIcon from "../icons/KeywordIcon";
import { useModal } from "../modals/ModalProvider";
import DragContainer from "../objects/DragContainer";
import UsernameWithTime from "../user/UsernameWithTime";

import { keywordIdMapping } from "@/app/database/keywordIds";
import useLocalState from "@/app/lib/useLocalState";

export default function RecommendedBuildsDisplay({ builds, setBuilds, editable = false }) {
    const [index, setIndex] = useState(null);
    const [displayType, setDisplayType] = useLocalState("buildDisplayType", "names");
    const { openSelectBuildModal } = useModal();
    const router = useRouter();

    const buildsRef = useRef(builds);
    useEffect(() => { buildsRef.current = builds }, [builds]);
    const build = useBuildState();
    const buildData = useMemo(() => builds[index], [builds, index]);
    
    const handleSelectBuild = selectedBuild => {
        const index = buildsRef.current.findIndex(x => x.id === selectedBuild.id);
        if (index === -1) {
            setBuilds(p => [...p, selectedBuild]);
            setIndex(buildsRef.current.length);
        } else {
            setIndex(index);
        }
    }

    useEffect(() => {
        const newBuild = builds[index];
        if(newBuild) build.setBuildState(newBuild);
        else build.setBuildState({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [builds, index]);

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {buildData ? <>
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: "0.2rem" }}>
                        {buildData.keyword_ids.map(id => <KeywordIcon key={id} id={keywordIdMapping[id]} />)}
                    </div>
                    {buildData.title}
                </h2>
                <UsernameWithTime data={buildData} scale={.9} avatarId={buildData.user_avatar_id} />
            </div>

            <BuildDisplay build={build} displayType={displayType} />

            <div style={{ display: "flex", gap: "0.2rem", alignSelf: builds.length > 0 ? "center" : "start", justifyContent: "center", flexWrap: "wrap" }}>
                {builds.length > 0 ? <>
                    <button disabled={index === 0} onClick={() => setIndex(p => p - 1)}>←</button>
                    <button disabled={index === builds.length - 1} onClick={() => setIndex(p => p + 1)}>→</button>
                    <button onClick={() => setIndex(null)}>View all builds</button>
                    {!editable ?
                        <button onClick={() => router.push(`/builds/${buildData.id}`)}>Go to build page</button> :
                        null
                    }
                </> :
                    null
                }
                {editable ? <>
                    <button onClick={() => openSelectBuildModal({ onSelectBuild: handleSelectBuild })}>Add Build</button>
                    <button onClick={() => {
                        setBuilds(p => p.filter((x, i) => i !== index))
                        if (index === builds.length - 1) setIndex(index - 1);
                    }}>Remove Build</button>
                </> :
                    null
                }
            </div>

            <DragContainer style={{ alignSelf: "center", width: "max-content", maxWidth: "100%" }}>
                <div style={{ display: "flex", gap: ".5rem", width: "max-content" }}>
                    <BuildDisplayMenuCard width={240}>
                        <div>Display Type</div>
                        <DisplayTypeButton value={displayType} setValue={setDisplayType} />
                        <span className="sub-text" style={{ textAlign: "center" }}>Quickly view various details of selected identities and E.G.Os or change how the team is displayed.</span>

                        <TeamCodeComponent teamCode={build.teamCode} />
                    </BuildDisplayMenuCard>
                    <Distribution build={build} />
                    <EventRolls build={build} />
                </div>
            </DragContainer>
        </> :
            <div style={{ borderTop: "1px var(--secondary-border-color) dotted", borderBottom: "1px var(--secondary-border-color) dotted", borderRadius: "1rem", boxSizing: "border-box" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "start", padding: "1rem", boxSizing: "border-box" }}>
                    {builds.length > 0 ?
                        <div style={{ paddingLeft: "1rem", overflowX: "auto", scrollbarWidth: "thin", width: "100%" }}>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                {builds.map((build, i) =>
                                    <div key={build.id} onClick={() => setIndex(i)}>
                                        <TeamBuild build={build} size={"S"} complete={false} clickable={false} />
                                    </div>
                                )}
                            </div>
                        </div> :
                        <div style={{ textAlign: "center" }}>
                            No builds selected...
                        </div>
                    }
                    {editable ? <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                        <button onClick={() => openSelectBuildModal({ onSelectBuild: handleSelectBuild })}>Add Build</button>
                        <span style={{ color: "var(--secondary-text-color)" }}>Select a build to remove it</span>
                    </div> :
                        null
                    }
                </div>
            </div>
        }
    </div>
}