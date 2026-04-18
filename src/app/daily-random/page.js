"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useState } from "react";

import BuildIdentitiesGrid from "../components/build/BuildIdentitiesGrid";
import TeamCodeComponent from "../components/build/TeamCodeComponent";
import { useData } from "../components/DataProvider";
import CommentSection from "../components/pageTemplates/CommentSection";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { commentsTargetIds } from "../lib/commentsTargetIds";
import { keywords } from "../lib/constants";
import { constructTeamCode } from "../lib/teamCodeEncoding";

function getResetDate(offsetDays = 0) {
    const base = new Date();
    base.setUTCDate(base.getUTCDate() + offsetDays);

    const SHIFT = 3 * 60 * 60 * 1000; // 6am at UTC+9 = +9-6

    const adjusted = new Date(base.getTime() + SHIFT);

    const year = adjusted.getUTCFullYear();
    const month = adjusted.getUTCMonth() + 1;
    const day = adjusted.getUTCDate();
    const dayOfWeek = adjusted.getUTCDay();

    return [`${year}-${month}-${day}`, dayOfWeek];
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash >>> 0;
}

function mulberry32(seed) {
    return function () {
        let t = (seed += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function splitIdsPerSinner(identities) {
    return identities.reduce((acc, identity) => {
        if (identity.sinnerId in acc) acc[identity.sinnerId].push(identity.id);
        else acc[identity.sinnerId] = [identity.id];
        return acc;
    }, {});
}

function takeNItems(rng, n, array) {
    for (let i = 0; i < n; i++) {
        const j = i + Math.floor(rng() * (array.length - i));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.slice(0, n);
}

function applyIds(rng, idsPerSinner) {
    return Object.entries(idsPerSinner).reduce((acc, [sinnerId, list]) => {
        acc[sinnerId - 1] = list[Math.floor(rng() * list.length)];
        return acc;
    }, Array.from({ length: 12 }, () => null));
}

function generateTeam(identities, offset = 0) {
    const [date, day] = getResetDate(offset);
    const rng = mulberry32(hashString(date));

    if (day === 0) {
        // Sun: full random
        const idsPerSinner = splitIdsPerSinner(Object.values(identities));
        return [applyIds(rng, idsPerSinner), date, day];
    } else if (day % 2 === 0) {
        // TThS: Keyword randomization
        const kwCount = 1 + Math.floor(rng() * 2);
        const kws = takeNItems(rng, kwCount, keywords.slice(0, 7));
        const idsPerSinner = splitIdsPerSinner(Object.values(identities).filter(id => (id.skillKeywordList ?? []).some(x => kws.includes(x))));
        return [applyIds(rng, idsPerSinner), date, day];
    } else {
        // MWF: Tag randomization
        const tags = {};
        Object.values(identities).forEach(id => (id.tags ?? []).forEach(x => {
            if (x in tags) tags[x].push(id);
            else tags[x] = [id];
        }));
        const tagOptions = Object.entries(tags).filter(([, list]) => list.length >= 4).map(([tag]) => tag).sort();
        const permuted = takeNItems(rng, tagOptions.length, tagOptions);
        const idsPerSinner = {};
        while (Object.keys(idsPerSinner).length < 12) {
            const tag = permuted.shift();
            tags[tag].forEach(identity => {
                if (identity.sinnerId in idsPerSinner) {
                    if (!idsPerSinner[identity.sinnerId].includes(identity.id))
                        idsPerSinner[identity.sinnerId].push(identity.id);
                } else idsPerSinner[identity.sinnerId] = [identity.id];
            })
        }
        return [applyIds(rng, idsPerSinner), date, day];
    }
}

export default function DailyRandomizedPage() {
    const [identities, identitiesLoading] = useData("identities_mini");

    const [identityIds, setIdentityIds] = useState(Array.from({ length: 12 }, () => null));
    const [prevIdentityIds, setPrevIdentityIds] = useState(Array.from({ length: 12 }, () => null));
    const [dateStr, setDateStr] = useState("");
    const [prevDateStr, setPrevDateStr] = useState("");

    const { isMobile } = useBreakpoint();

    useEffect(() => {
        if (identitiesLoading) return;
        const [team1, date1, day1] = generateTeam(identities);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIdentityIds(team1);
        setDateStr(date1);
        const [team2, date2, day2] = generateTeam(identities, -1);
        setPrevIdentityIds(team2);
        setPrevDateStr(date2);
    }, [identities, identitiesLoading]);

    if (identitiesLoading) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <h3 style={{ margin: 0 }}>Daily Randomized Team</h3>
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>A randomized team every day to use in MD or other content. The team changes every day at 6AM KST (the same daily reset as the game).</span>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <h4 style={{ margin: 0 }}>Today&apos;s Team ({dateStr})</h4>
                <BuildIdentitiesGrid identityIds={identityIds} scale={isMobile ? .2 : .33} />
                <TeamCodeComponent teamCode={constructTeamCode(identityIds, [], [])} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <h4 style={{ margin: 0 }}>Yesterday&apos;s Team ({prevDateStr})</h4>
                <BuildIdentitiesGrid identityIds={prevIdentityIds} scale={isMobile ? .2 : .33} />
                <TeamCodeComponent teamCode={constructTeamCode(prevIdentityIds, [], [])} />
            </div>
        </div>
        <h4 style={{ margin: 0 }}>How does this randomizer work?</h4>
        <span style={{ maxWidth: "1000px", textAlign: "start", lineHeight: "1.3" }}>
            The type of random team it generates differs depending on the day of the week. These rules may change at any moment if I think of or if people suggest more interesting ones.
            <ul style={{ margin: 0 }}>
                <li>Mon, Wed, Fri: All identity Tags/Factions with at least 4 identities are pooled together, then randomly picked one at a time until it&apos;s possible to generate a team with the selected ones. The team is randomized based on the identities in the chosen Tags/Factions.</li>
                <li>Tue, Thu, Sat: 1-3 keywords are randomly selected. A team is randomized based on all identities with at least one of those keywords. Identities with other keywords may be selected, as long as they have at least one of the randomized keywords.</li>
                <li>Sun: A team is randomized from all identities in the game.</li>
            </ul>
            The randomizer uses the date as its random seed, making sure that everyone gets the same team. There is a small caveat that if the data changes, the randomized teams can also change, so be wary of days when new data may be added.
        </span>

        <div style={{ border: "1px #777 solid", width: "100%" }} />
        
        <div style={{ width: "clamp(300px, 100%, 1200px)", alignSelf: "center" }}>
            <CommentSection targetType={"fixed"} targetId={commentsTargetIds.dailyRandom} ownerId={"None"} />
        </div>
    </div>;
}
