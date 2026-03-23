import { useBreakpoint } from "@eldritchtools/shared-components";

import TeamBuild from "../contentCards/TeamBuild";

import useLocalState from "@/app/lib/useLocalState";

export default function BuildsSearchDisplay({ builds }) {
    const [compressed, setCompressed] = useLocalState("buildsCompressed", false);
    const { isMobile } = useBreakpoint();

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {!isMobile ?
            <div style={{ alignSelf: "center" }}>
                <label>
                    <input type="checkbox" checked={compressed} onChange={e => setCompressed(e.target.checked)} />
                    Compressed View
                </label>
            </div> : null}

        {isMobile ?
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 300px)", gap: "1rem", justifyContent: "center" }}>
                {builds.map(build => <TeamBuild key={build.id} build={build} size={"S"} />)}
            </div> :
            compressed ?
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 460px)", gap: "1rem", justifyContent: "center" }}>
                    {builds.map(build => <TeamBuild key={build.id} build={build} size={"M"} />)}
                </div> :
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 640px)", gap: "1rem", justifyContent: "center" }}>
                    {builds.map(build => <TeamBuild key={build.id} build={build} size={"L"} />)}
                </div>
        }
    </div>
}
