import { useCallback, useEffect, useState } from "react";

import { useData } from "../components/DataProvider";
import { egoRankMapping } from "../lib/constants";

// phases
// setup, waiting, countdown, choosing, transition, finished

export function useDraft(settings, generateChoices) {
    const [identitiesData, identitiesLoading] = useData("identities_mini");
    const [egosData, egosLoading] = useData("egos_mini");

    const [phase, setPhase] = useState("setup");
    const [round, setRound] = useState(0);
    const [identities, setIdentities] = useState(null);
    const [egos, setEgos] = useState(null);
    const [choices, setChoices] = useState([]);
    const [chosen, setChosen] = useState(null);
    const [endTime, setEndTime] = useState(0);
    const [now, setNow] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [blocked, setBlocked] = useState(null);

    const goto = useCallback(phase => {
        setPhase(phase);
    }, []);

    const nextRound = useCallback((newIds, newEgos, newBlocked) => {
        const generated = generateChoices(
            newIds ?? identities,
            newEgos ?? egos,
            newBlocked ?? blocked,
            newBlocked => setBlocked(p => new Set([...p, ...newBlocked]))
        );

        if(generated.length === 0) {
            goto("finished");
            return;
        }

        setChoices(generated);
        setChosen(null);
        setCountdown(settings.countdownTime);

        goto(settings.autoAdvance ? "countdown" : "waiting");
    }, [settings, generateChoices, identities, egos, blocked, goto]);

    const startDraft = useCallback(() => {
        if(identitiesLoading || egosLoading) return;

        const newIds = Array.from({ length: 12 }, () => null);
        const newEgos = Array.from({ length: 12 }, () => (Array.from({ length: 5 }, () => null)));
        const newBlocked = new Set();
        setIdentities(newIds)
        setEgos(newEgos);
        setBlocked(newBlocked);
        setRound(1);

        const id = setTimeout(() => {
            nextRound(newIds, newEgos, newBlocked);
        }, 1);

        return () => clearTimeout(id);
    }, [nextRound, identitiesLoading, egosLoading]);

    const returnToSetup = useCallback(() => {
        goto("setup");
    }, [goto]);

    const beginCountdown = useCallback(() => {
        setCountdown(settings.countdownTime);
        goto("countdown");
    }, [goto, settings]);

    const beginChoosing = useCallback(() => {
        setEndTime(Date.now() + settings.choiceTime * 1000);
        goto("choosing");
    }, [goto, settings]);

    const choose = useCallback(index => {
        const selected = choices[index];

        setIdentities(p => {
            const sinnerId = identitiesData[selected[0]].sinnerId
            return p.map((x, i) => i + 1 === sinnerId ? selected[0] : x)
        })

        setEgos(p => {
            const list = p.map(x => [...x]);
            const assignEgo = id => {
                if(!id) return;
                list[egosData[id].sinnerId-1][egoRankMapping[egosData[id].rank]] = id
            }

            selected.forEach((x, i) => {if(i !== 0) assignEgo(x)});
            return list;
        });
        
        setChosen(index);
        goto("transition");
    }, [goto, choices, identitiesData, egosData]);

    const autoPick = useCallback(() => {
        const random = Math.floor(Math.random() * choices.length);
        choose(random);
    }, [choose, choices]);

    useEffect(() => {
        if (phase !== "countdown") return;

        if (countdown <= 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            beginChoosing();
            return;
        }

        const id = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);

        return () => clearTimeout(id);
    }, [phase, countdown, beginChoosing]);

    useEffect(() => {
        if (phase !== "choosing") return;
        if (settings.choiceTime === 0) return;

        let frame;

        const tick = () => {
            const newNow = Date.now();
            const remaining = endTime - newNow;

            if (remaining <= 0) {
                autoPick();
                return;
            }

            setNow(newNow);
            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [phase, settings, endTime, autoPick]);

    useEffect(() => {
        if (phase !== "transition") return;

        const id = setTimeout(() => {
            if (round >= settings.rounds) {
                goto("finished");
                return;
            }

            setRound(r => r + 1);
            nextRound();
        }, 1000);

        return () => clearTimeout(id);
    }, [phase, round, settings, goto, nextRound]);

    return {
        phase, round, identities, egos, choices, chosen, endTime, now, countdown, blocked,
        goto, startDraft, returnToSetup, beginCountdown, choose
    };
}