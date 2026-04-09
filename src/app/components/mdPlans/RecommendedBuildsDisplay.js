"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import BuildDisplay from "../build/BuildDisplay";
import BuildDisplayMenuCard from "../build/BuildDisplayMenuCard";
import DisplayTypeButton from "../build/DisplayTypeButton";
import SinDistribution from "../build/SinDistribution";
import TeamCodeComponent from "../build/TeamCodeComponent";
import TeamBuild from "../contentCards/TeamBuild";
import KeywordIcon from "../icons/KeywordIcon";
import { useModal } from "../modals/ModalProvider";
import UsernameWithTime from "../user/UsernameWithTime";

import { keywordIdMapping } from "@/app/database/keywordIds";
import { decodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";
import { constructTeamCode } from "@/app/lib/teamCodeEncoding";

export default function RecommendedBuildsDisplay({ builds, setBuilds, editable = false }) {
    const [index, setIndex] = useState(null);
    const { openSelectBuildModal } = useModal();
    const router = useRouter();
    const [build, extraOpts] = useMemo(
        () => builds.length > 0 && index !== null ?
            [builds[index], decodeBuildExtraOpts(builds[index].extra_opts)] :
            [null, null],
        [builds, index]
    );
    const teamCode = useMemo(() => build ? "" : constructTeamCode(build.identity_ids, build.ego_ids, build.deployment_order), [build]);

    const handleSelectBuild = x => {
        const index = builds.findIndex(x => x.id === build.id);
        if (index === -1) {
            setBuilds(p => [...p, build]);
            setIndex(builds.length);
        } else {
            setIndex(index);
        }
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {build ? <>
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: "0.2rem" }}>
                        {build.keyword_ids.map(id => <KeywordIcon key={id} id={keywordIdMapping[id]} />)}
                    </div>
                    {build.title}
                </h2>
                <UsernameWithTime data={build} scale={.9} />
            </div>

            <BuildDisplay
                identityIds={build.identity_ids}
                egoIds={build.ego_ids}
                identityUpties={extraOpts.identityUpties}
                identityLevels={extraOpts.identityLevels}
                egoThreadspins={extraOpts.egoThreadspins}
                sinnerNotes={extraOpts.sinnerNotes}
                deploymentOrder={build.deployment_order}
                activeSinners={build.active_sinners}
                displayType={"names"}
            />

            <div style={{ display: "flex", gap: "0.2rem", alignSelf: builds.length > 0 ? "center" : "start", justifyContent: "center", flexWrap: "wrap" }}>
                {builds.length > 0 ? <>
                    <button disabled={index === 0} onClick={() => setIndex(p => p - 1)}>←</button>
                    <button disabled={index === builds.length - 1} onClick={() => setIndex(p => p + 1)}>→</button>
                    <button onClick={() => setIndex(null)}>View all builds</button>
                    {!editable ?
                        <button onClick={() => router.push(`/builds/${build.id}`)}>Go to build page</button> :
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

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <BuildDisplayMenuCard>
                    <div>Display Type</div>
                    <DisplayTypeButton value={displayType} setValue={setDisplayType} />
                </BuildDisplayMenuCard>
                <SinDistribution
                    identityIds={build.identity_ids}
                    identityUpties={extraOpts.identityUpties}
                    deploymentOrder={build.deployment_order}
                    activeSinners={build.active_sinners}
                />
                <TeamCodeComponent teamCode={teamCode} />
            </div>
        </> :
            <div style={{ borderTop: "1px #777 dotted", borderBottom: "1px #777 dotted", borderRadius: "1rem", boxSizing: "border-box" }}>
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
                        <span style={{ color: "#aaa" }}>Select a build to remove it</span>
                    </div> :
                        null
                    }
                </div>
            </div>
        }
    </div>
}