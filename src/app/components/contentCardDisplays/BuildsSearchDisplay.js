import { useBreakpoint } from "@eldritchtools/shared-components";

import TeamBuild from "../contentCards/TeamBuild";

import useLocalState from "@/app/lib/useLocalState";

const sizeMapping = {
    "S": 300,
    "M": 460,
    "L": 640
}

export default function BuildsSearchDisplay({ builds, complete = true, clickOverride, sizeOverride }) {
    const [compressed, setCompressed] = useLocalState("buildsCompressed", false);
    const { isMobile } = useBreakpoint();
    const size = sizeOverride ?? (isMobile ? "S" : compressed ? "M" : "L");

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {!isMobile && !sizeOverride ?
            <div style={{ alignSelf: "center" }}>
                <label>
                    <input type="checkbox" checked={compressed} onChange={e => setCompressed(e.target.checked)} />
                    Compressed View
                </label>
            </div> : null}

        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, ${sizeMapping[size]}px)`, gap: "1rem", justifyContent: "center" }}>
            {builds.map(build => <div key={build.id} onClick={clickOverride ? () => clickOverride(build) : undefined}>
                <TeamBuild build={build} size={size} complete={complete} clickable={!clickOverride} />
            </div>)}
        </div>
    </div>
}
