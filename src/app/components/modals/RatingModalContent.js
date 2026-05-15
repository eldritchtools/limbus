"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import TeamBuild from "../contentCards/TeamBuild";
import { useSkillData } from "../dataHooks/skills";
import { useData } from "../DataProvider";
import Icon from "../icons/Icon";
import KeywordIcon from "../icons/KeywordIcon";
import RatingComponent from "../ratings/RatingComponent";
import ReviewsComponent from "../ratings/ReviewsComponent";
import PassiveCard from "../skill/PassiveCard";
import SkillCard from "../skill/SkillCard";

import { searchBuilds } from "@/app/database/builds";
import { ColoredResistance } from "@/app/lib/colors";
import { affinities, LEVEL_CAP, sinnerIdMapping } from "@/app/lib/constants";
import { constructDefenseLevel, constructHp, constructSpeed } from "@/app/lib/identity";
import { constructSkillLabel } from "@/app/lib/skill";
import useLocalState from "@/app/lib/useLocalState";

function IdentityDetails({ id }) {
    const [identities, identitiesLoading] = useData("identities");
    const { skills: skills, combatPassives: combatPassives, supportPassives: supportPassives } = useSkillData("identity", id, 4);
    const router = useRouter();

    const componentList = useMemo(() => {
        if (identitiesLoading || !skills || !combatPassives || !supportPassives) return [];
        const data = identities[id];
        const list = [];

        list.push(<div key={list.length} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", justifyContent: "center" }}>
            <div>
                {(data.skillKeywordList || []).map(x => <KeywordIcon key={x} id={x} />)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Icon path={"hp"} style={{ width: "32px", height: "32px" }} />
                {constructHp(data, LEVEL_CAP)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Icon path={"speed"} style={{ width: "32px", height: "32px" }} />
                {constructSpeed(data, 4)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Icon path={"defense level"} style={{ width: "32px", height: "32px" }} />
                {constructDefenseLevel(data, LEVEL_CAP)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <KeywordIcon id={"Slash"} />
                <ColoredResistance resist={data.resists.slash} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <KeywordIcon id={"Pierce"} />
                <ColoredResistance resist={data.resists.pierce} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <KeywordIcon id={"Blunt"} />
                <ColoredResistance resist={data.resists.blunt} />
            </div>
            <button onClick={() => { router.push(`/identities/${id}`); }}>Go to page</button>
        </div>);

        [1, 2, 3, 4].forEach(tier => {
            const sublist = data.skillTypes.filter(s => s.type.tier === tier);
            if (sublist.length === 0) return;
            sublist.forEach((skill, index) => {
                if (!(skill.id in skills)) return;
                list.push(<SkillCard
                    key={list.length}
                    skill={skills[skill.id].data}
                    count={skill.num}
                    label={constructSkillLabel("attack", tier, index)}
                />);
            })
        });

        data.defenseSkillTypes.forEach(skill => {
            if (!(skill.id in skills)) return;
            list.push(<SkillCard
                key={list.length}
                skill={skills[skill.id].data}
                label={constructSkillLabel("defense")}
            />);
        })

        combatPassives.forEach(passive => {
            list.push(<PassiveCard key={list.length} passive={passive} label={constructSkillLabel("combat")} />)
        });
        supportPassives.forEach(passive => {
            list.push(<PassiveCard key={list.length} passive={passive} label={constructSkillLabel("support")} />)
        });

        return list;
    }, [identities, identitiesLoading, id, skills, combatPassives, supportPassives, router]);

    if (identitiesLoading) return <div>Loading...</div>;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {componentList}
    </div>
}

function EgoDetails({ id }) {
    const [egos, egosLoading] = useData("egos");
    const { awakeningSkills: awakeningSkills, corrosionSkills: corrosionSkills, passives: passives } = 
        useSkillData("ego", id, egosLoading ? 4 : (egos[id].maxThreadspin ?? 4));
    const router = useRouter();

    const componentList = useMemo(() => {
        if (egosLoading || !awakeningSkills || !corrosionSkills || !passives) return [];
        const data = egos[id];
        const list = [];

        list.push(<div key={list.length} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span>Cost</span>
                <span>Resist</span>
            </div>
            {affinities.map(affinity => <div key={affinity} style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                <KeywordIcon id={affinity} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {affinity in data.cost ? data.cost[affinity] : <span style={{ color: "var(--disabled-text-color)" }}>0</span>}
                    {<ColoredResistance resist={data.resists[affinity]} />}
                </div>
            </div>)}
            <button onClick={() => { router.push(`/egos/${id}`); }}>Go to page</button>
        </div>);

        awakeningSkills.forEach(skill => {
            list.push(<SkillCard key={list.length} skill={skill.data} label={constructSkillLabel("awakening")} />);
        });

        corrosionSkills.forEach(skill => {
            list.push(<SkillCard key={list.length} skill={skill.data} label={constructSkillLabel("corrosion")} />);
        });

        passives.forEach(passive => {
            list.push(<PassiveCard key={list.length} passive={passive} label={constructSkillLabel("passive")} />)
        });

        return list;
    }, [egos, egosLoading, id, awakeningSkills, corrosionSkills, passives, router]);

    if (egosLoading) return <div>Loading...</div>;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {componentList}
    </div>
}

function BuildsTab({ builds }) {
    if (!builds) return <div style={{ color: "var(--disbled-text-color)", textAlign: "center" }}>Loading builds...</div>;
    if (builds.length === 0) return <div style={{ color: "var(--disbled-text-color)", textAlign: "center" }}>No builds found.</div>;
    return <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginLeft: "7px" }}>
        {builds.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
    </div>
}

export default function RatingModalContent({ type, id, getCommunityReviews, getUserReviews, onChange }) {
    const [identities, identitiesLoading] = useData("identities_mini")
    const [egos, egosLoading] = useData("egos_mini");
    const [, updateCount] = useState(0);
    const [tab, setTab, tabInitialized] = useLocalState("ratingModalTab", "latest");
    const [builds, setBuilds] = useState(null);
    const { isDesktop } = useBreakpoint();

    const triggerRender = useCallback(() => { updateCount(p => p + 1) }, []);

    const handleChange = async x => {
        await onChange(x);

        setTimeout(() => {
            triggerRender();
        }, 0);
    }

    const review = getUserReviews()?.[id];
    const communityRating = getCommunityReviews()?.[id];

    useEffect(() => {
        const fetchBuilds = async () => {
            const params = { published: true, sortBy: "popular" };
            if (type === "identity") params["identities"] = [id];
            else if (type === "ego") params["egos"] = [id];

            setBuilds(await searchBuilds(params, 1, 20) || []);
        }

        if (tab === "builds" && !builds) fetchBuilds();
    }, [type, tab, builds, id])

    const name = type === "identity" ?
        (identitiesLoading ? "" : `[${sinnerIdMapping[identities[id].sinnerId]}] ${identities[id].name}`) :
        (egosLoading ? "" : `[${sinnerIdMapping[egos[id].sinnerId]}] ${egos[id].name}`)

    return <div style={{ display: "flex", flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? null : "center", gap: "0.5rem", maxHeight: "80vh" }}>
        <div style={{ maxWidth: "min(340px, 100%)", paddingBottom: "2rem" }}>
            <h2 className="title-text" style={{ textAlign: "center" }}>{name}</h2>
            <RatingComponent type={type} id={id} globalData={communityRating} userData={review} onChange={handleChange} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "min(320px, 90vw)", flex: 1, minHeight: 0 }}>
            <div style={{ alignSelf: "center", maxWidth: "90vw", overflowX: "auto", overflowY: "hidden", padding: "0.25rem", boxSizing: "border-box", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "1rem", width: "max-content" }}>
                    <div className={`tab-header ${tab === "latest" ? "active" : ""}`} onClick={() => setTab("latest")}>Latest</div>
                    <div className={`tab-header ${tab === "active" ? "active" : ""}`} onClick={() => setTab("active")}>Active</div>
                    <div className={`tab-header ${tab === "top" ? "active" : ""}`} onClick={() => setTab("top")}>Top</div>
                    <div className={`tab-header ${tab === "details" ? "active" : ""}`} onClick={() => setTab("details")}>
                        {type === "identity" ? "Identity " : "E.G.O "}Details
                    </div>
                    <div className={`tab-header ${tab === "builds" ? "active" : ""}`} onClick={() => setTab("builds")}>Popular Builds</div>
                </div>
            </div>
            <div style={isDesktop ? { overflowY: "auto", flex: 1, minHeight: 0 } : {}}>
                {tab === "details" ?
                    (type === "identity" ? <IdentityDetails id={id} /> : <EgoDetails id={id} />) :
                    (tab === "builds" ?
                        <BuildsTab builds={builds} /> :
                        (tabInitialized && <ReviewsComponent type={type} id={id} sortType={tab} userReview={review} />)
                    )
                }
            </div>
        </div>
    </div>
}