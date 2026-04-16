"use client";

import { useMemo } from "react";

import { useData } from "../DataProvider";

function useIdentitiesWithUpcoming(mini=false) {
    const [identities, identitiesLoading] = useData(mini ? "identities_mini" : "identities");
    const [upcoming, upcomingLoading] = useData("upcoming");

    const identitiesCombined = useMemo(() => {
        if (identitiesLoading || upcomingLoading) return {};
        const result = {...identities};
        if(upcoming.identities)
            Object.entries(upcoming.identities).forEach(([id, x]) => {
                result[id] = {...x, upcoming: true, date: upcoming.date};
            });
        return result;
    }, [identities, identitiesLoading, upcoming, upcomingLoading]);

    return [identitiesCombined, identitiesLoading || upcomingLoading];
}

function useEgosWithUpcoming(mini=false) {
    const [egos, egosLoading] = useData(mini ? "egos_mini" : "egos");
    const [upcoming, upcomingLoading] = useData("upcoming");

    const egosCombined = useMemo(() => {
        if (egosLoading || upcomingLoading) return {};
        const result = {...egos};
        if(upcoming.egos)
            Object.entries(upcoming.egos).forEach(([id, x]) => {
                result[id] = {...x, upcoming: true, date: upcoming.date};
            });
        return result;
    }, [egos, egosLoading, upcoming, upcomingLoading]);

    return [egosCombined, egosLoading || upcomingLoading];
}

export { useIdentitiesWithUpcoming, useEgosWithUpcoming };