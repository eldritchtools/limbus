"use client";

import { useMemo } from "react";

import { useData } from "../DataProvider";

import { mergeUpcoming } from "@/app/lib/upcoming";

function useIdentitiesWithUpcoming(mini=false) {
    const [identities, identitiesLoading] = useData(mini ? "identities_mini" : "identities");
    const [upcoming, upcomingLoading] = useData("upcoming");

    const identitiesCombined = useMemo(() => {
        if (identitiesLoading || upcomingLoading) return {};
        if(upcoming.identities) return mergeUpcoming(identities, upcoming.identities, upcoming.date);
        else return identities;
    }, [identities, identitiesLoading, upcoming, upcomingLoading]);

    return [identitiesCombined, identitiesLoading || upcomingLoading];
}

function useEgosWithUpcoming(mini=false) {
    const [egos, egosLoading] = useData(mini ? "egos_mini" : "egos");
    const [upcoming, upcomingLoading] = useData("upcoming");

    const egosCombined = useMemo(() => {
        if (egosLoading || upcomingLoading) return {};
        if(upcoming.egos) return mergeUpcoming(egos, upcoming.egos, upcoming.date);
        else return egos;
    }, [egos, egosLoading, upcoming, upcomingLoading]);

    return [egosCombined, egosLoading || upcomingLoading];
}

export { useIdentitiesWithUpcoming, useEgosWithUpcoming };