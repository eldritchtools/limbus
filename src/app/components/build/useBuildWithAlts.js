import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useData } from "../DataProvider";
import { useModal } from "../modals/ModalProvider";

import { egoRankMapping } from "@/app/lib/constants";
import { constructTeamCode } from "@/app/lib/teamCodeEncoding";

function isIdentity(id) {
    if (typeof id === "string") return id[0] === '1';
    else return id > 10000 && id < 20000;
}

export default function useBuildWithAlts(build) {
    // const [identities, identitiesLoading] = useData("identities_mini");
    const { openAltOptionsModal } = useModal();
    const [egos, egosLoading] = useData("egos_mini");
    const [selectedAlts, setSelectedAlts] = useState(Array.from({ length: 12 }, () => []));

    const selectedAltsRef = useRef(selectedAlts);

    useEffect(() => {
        selectedAltsRef.current = selectedAlts;
    }, [selectedAlts]);

    const toggleAlt = (sinnerId, id) => {
        if (isIdentity(id)) {
            setSelectedAlts(p => p.map((x, i) => i === sinnerId - 1 ? (
                x.includes(id) ? x.filter(y => y !== id) : [...x.filter(y => !isIdentity(y)), id]
            ) : x));
        } else {
            const rank = egos[id].rank;
            setSelectedAlts(p => p.map((x, i) => i === sinnerId - 1 ? (
                x.includes(id) ? x.filter(y => y !== id) : [...x.filter(y => isIdentity(y) || egos[y].rank !== rank), id]
            ) : x));
        }
    };

    const [identityIds, egoIds] = useMemo(() => {
        if (egosLoading) return [build.identityIds, build.egoIds];

        const identityIds = [...build.identityIds];
        const egoIds = build.egoIds.map(x => [...x]);

        selectedAlts.forEach((alts, i) => {
            alts.forEach((alt) => {
                if (isIdentity(alt)) {
                    identityIds[i] = alt;
                } else {
                    egoIds[i][egoRankMapping[egos[alt].rank]] = alt;
                }
            })
        })

        return [identityIds, egoIds];
    }, [egosLoading, build, egos, selectedAlts]);

    const teamCode = constructTeamCode(identityIds, egoIds, build.deploymentOrder);

    const openEditAltOptionsModal = sinnerId =>
        openAltOptionsModal({
            altOptions: build.altOptions[sinnerId - 1],
            getSelectedAlts: sinnerId => selectedAltsRef.current[sinnerId - 1],
            toggleAlt: id => toggleAlt(sinnerId, id),
            sinnerId, editable: false
        })

    const resetSelectedAlts = () => setSelectedAlts(Array.from({ length: 12 }, () => []));

    return {
        ...build,
        identityIds,
        egoIds,
        teamCode,
        openEditAltOptionsModal,
        resetSelectedAlts
    };
}