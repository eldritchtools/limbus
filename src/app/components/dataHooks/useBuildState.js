"use client";

import { useCallback, useMemo, useState } from "react";

import { useEgosWithUpcoming, useIdentitiesWithUpcoming } from "./upcoming";

import { decodeBuildExtraOpts, encodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";
import { egoRankMapping } from "@/app/lib/constants";
import { constructTeamCode, parseTeamCode } from "@/app/lib/teamCodeEncoding";

export default function useBuildState() {
    const [identities, identitiesLoading] = useIdentitiesWithUpcoming();
    const [egos, egosLoading] = useEgosWithUpcoming();

    const [identityIds, setIdentityIds] = useState(Array.from({ length: 12 }, () => null));
    const [egoIds, setEgoIds] = useState(Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => null)));
    const [deploymentOrder, setDeploymentOrder] = useState([]);
    const [activeSinners, setActiveSinners] = useState(7);
    const [identityUpties, setIdentityUpties] = useState(Array.from({ length: 12 }, () => ""));
    const [identityLevels, setIdentityLevels] = useState(Array.from({ length: 12 }, () => ""));
    const [egoThreadspins, setEgoThreadspins] = useState(Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => "")));
    const [sinnerNotes, setSinnerNotes] = useState(Array.from({ length: 12 }, () => ""));
    const [altOptions, setAltOptions] = useState(Array.from({ length: 12 }, () => []));
    const [addedIcons, setAddedIcons] = useState([]);
    const [iconSwaps, setIconSwaps] = useState([]);
    const [skillReplaces, setSkillReplaces] = useState({});

    const setIdentityIdAt = useCallback((index, id) => {
        setIdentityIds(prev => prev.map((x, i) => i === index ? id : x));
    }, []);

    const setIdentityId = useCallback(id => {
        if (identitiesLoading) return;
        const index = identities[id].sinnerId - 1;
        setIdentityIdAt(index, id);
    }, [identities, identitiesLoading, setIdentityIdAt]);

    const setEgoIdAt = useCallback((index, rank, id) => {
        setEgoIds(prev => prev.map((x, i) => i === index ? x.map((y, r) => r === rank ? id : y) : x));
    }, []);

    const setEgoId = useCallback(id => {
        if (egosLoading) return;
        const index = egos[id].sinnerId - 1;
        const rank = egoRankMapping[egos[id].rank];
        setEgoIdAt(index, rank, id);
    }, [egos, egosLoading, setEgoIdAt]);

    const setIdentityUptie = useCallback((index, uptie) => {
        setIdentityUpties(prev => prev.map((x, i) => i === index ? uptie : x));
    }, []);

    const setIdentityLevel = useCallback((index, level) => {
        setIdentityLevels(prev => prev.map((x, i) => i === index ? level : x));
    }, []);

    const setEgoThreadspin = useCallback((index, rank, threadspin) => {
        setEgoThreadspins(prev => prev.map((x, i) => i === index ? x.map((y, r) => r === rank ? threadspin : y) : x));
    }, []);

    const setSinnerNote = useCallback((index, note) => {
        setSinnerNotes(prev => prev.map((x, i) => i === index ? note : x));
    }, []);

    const toggleIconSwap = useCallback(index => {
        setIconSwaps(prev => prev.includes(index) ? prev.filter(x => x !== index) : [...prev, index]);
    }, []);

    const setSkillReplace = useCallback((index, rep) => {
        setSkillReplaces(prev => ({ ...prev, [index]: rep }));
    }, []);

    const addAltOption = useCallback((index, id) => {
        setAltOptions(prev => prev.map((x, i) => i === index ? [ ...x, {id: id, desc: ""} ] : x));
    }, []);

    const removeAltOption = useCallback((index, id) => {
        setAltOptions(prev => prev.map((x, i) => i === index ? x.filter(v => v.id !== id) : x));
    }, []);

    const setAltOptionDesc = useCallback((index, id, desc) => {
        setAltOptions(prev => prev.map((x, i) => i === index ? x.map(v => v.id === id ? {...v, desc: desc} : v) : x));
    }, []);

    const unpackExtraOpts = useCallback(extraOpts => {
        if ("identityLevels" in extraOpts) setIdentityLevels(extraOpts.identityLevels);
        else setIdentityLevels(Array.from({ length: 12 }, () => ""));

        if ("identityUpties" in extraOpts) setIdentityUpties(extraOpts.identityUpties);
        else setIdentityUpties(Array.from({ length: 12 }, () => ""));

        if ("egoThreadspins" in extraOpts) setEgoThreadspins(extraOpts.egoThreadspins);
        else setEgoThreadspins(Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => "")));

        if ("sinnerNotes" in extraOpts) setSinnerNotes(extraOpts.sinnerNotes);
        else setSinnerNotes(Array.from({ length: 12 }, () => ""));

        if ("altOptions" in extraOpts) setAltOptions(extraOpts.altOptions);
        else setAltOptions(Array.from({ length: 12 }, () => []));

        if ("addedIcons" in extraOpts) setAddedIcons(extraOpts.addedIcons);
        else setAddedIcons([]);

        if ("iconSwaps" in extraOpts) setIconSwaps(extraOpts.iconSwaps);
        else setIconSwaps([]);
    }, []);

    const setBuildState = useCallback(build => {
        if (build.identity_ids) setIdentityIds(build.identity_ids);
        else if (build.identityIds) setIdentityIds(build.identityIds);
        else setIdentityIds(Array.from({ length: 12 }, () => null));

        if (build.ego_ids) setEgoIds(build.ego_ids);
        else if (build.egoIds) setEgoIds(build.egoIds);
        else setEgoIds(Array.from({ length: 12 }, () => Array.from({ length: 5 }, () => null)));

        if (build.deployment_order) setDeploymentOrder(build.deployment_order);
        else if (build.deploymentOrder) setDeploymentOrder(build.deploymentOrder);
        else setDeploymentOrder([]);

        if (build.active_sinners) setActiveSinners(build.active_sinners);
        else if (build.activeSinners) setActiveSinners(build.activeSinners);
        else setActiveSinners(7);

        if(build.decodedExtraOpts) {
            unpackExtraOpts(build.decodedExtraOpts);
        } else {
            const extraOpts = decodeBuildExtraOpts(build.extra_opts ?? build.extraOpts ?? null);
            unpackExtraOpts(extraOpts);
        }
    }, [unpackExtraOpts]);

    const buildExtraOpts = useCallback(() => {
        return encodeBuildExtraOpts({ identityUpties, identityLevels, egoThreadspins, sinnerNotes, altOptions, addedIcons, iconSwaps });
    }, [identityUpties, identityLevels, egoThreadspins, sinnerNotes, altOptions, addedIcons, iconSwaps]);

    const teamCode = useMemo(() =>
        constructTeamCode(identityIds, egoIds, deploymentOrder),
        [identityIds, egoIds, deploymentOrder]
    )

    const setTeamCode = useCallback(teamCode => {
        const parseResult = parseTeamCode(teamCode);
        if (!parseResult) return;
        setDeploymentOrder([...parseResult.deploymentOrder]);
        setIdentityIds([...parseResult.identities]);
        setEgoIds(parseResult.egos.map(egos => [...egos]));
    }, []);

    return {
        identityIds, setIdentityIdAt, setIdentityId, setIdentityIds,
        egoIds, setEgoIdAt, setEgoId, setEgoIds, 
        deploymentOrder, setDeploymentOrder,
        activeSinners, setActiveSinners,
        teamCode, setTeamCode,
        identityUpties, setIdentityUptie,
        identityLevels, setIdentityLevel,
        egoThreadspins, setEgoThreadspin,
        sinnerNotes, setSinnerNote,
        addedIcons, setAddedIcons,
        iconSwaps, toggleIconSwap,
        skillReplaces, setSkillReplace,
        altOptions, addAltOption, removeAltOption, setAltOptionDesc,
        setBuildState, buildExtraOpts, unpackExtraOpts
    }
}

