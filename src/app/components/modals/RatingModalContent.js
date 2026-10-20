"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useCallback, useEffect, useMemo, useState } from "react";

import TeamBuild from "../contentCards/TeamBuild";
import { useSkillData } from "../dataHooks/skills";
import { useData } from "../DataProvider";
import { useModal } from "./ModalProvider";
import Icon from "../icons/Icon";
import KeywordIcon from "../icons/KeywordIcon";
import MarkdownEditorWrapper from "../markdown/MarkdownEditorWrapper";
import NoPrefetchLink from "../NoPrefetchLink";
import RatingComponent from "../ratings/RatingComponent";
import ReviewsComponent from "../ratings/ReviewsComponent";
import PassiveCard from "../skill/PassiveCard";
import SanityCard from "../skill/SanityCard";
import SkillCard from "../skill/SkillCard";

import { useAuth } from "@/app/database/authProvider";
import { searchBuilds } from "@/app/database/builds";
import { getItemAggregates, getOverallScore, getReviewScores, getUserReview } from "@/app/database/reviews";
import { ColoredResistance } from "@/app/lib/colors";
import { affinities, LEVEL_CAP, sinnerIdMapping } from "@/app/lib/constants";
import { constructDefenseLevel, constructHp, constructSpeed } from "@/app/lib/identity";
import { constructSkillLabel } from "@/app/lib/skill";
import useLocalState from "@/app/lib/useLocalState";

function IdentityDetails({ id }) {
    const [identities, identitiesLoading] = useData("identities");
    const { skills: skills, combatPassives: combatPassives, supportPassives: supportPassives, sanity: sanity } = useSkillData("identity", id, 4);

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
            <NoPrefetchLink href={`/identities/${id}`} className="text-link" guarded={true}>
                Go to page
            </NoPrefetchLink>
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

        if (sanity) {
            list.push(<SanityCard sanityData={sanity} noTitle={true} />)
        }

        return list;
    }, [identities, identitiesLoading, id, skills, combatPassives, supportPassives, sanity]);

    if (identitiesLoading) return <div>Loading...</div>;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {componentList}
    </div>
}

function EgoDetails({ id }) {
    const [egos, egosLoading] = useData("egos");
    const { awakeningSkills: awakeningSkills, corrosionSkills: corrosionSkills, passives: passives } =
        useSkillData("ego", id, egosLoading ? 4 : (egos[id].maxThreadspin ?? 4));

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
            <NoPrefetchLink href={`/identities/${id}`} className="text-link" guarded={true}>
                Go to page
            </NoPrefetchLink>
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
    }, [egos, egosLoading, id, awakeningSkills, corrosionSkills, passives]);

    if (egosLoading) return <div>Loading...</div>;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {componentList}
    </div>
}

function BuildsTab({ builds }) {
    if (!builds) return <div style={{ color: "var(--disbled-text-color)", textAlign: "center" }}>Loading builds...</div>;
    if (builds.length === 0) return <div style={{ color: "var(--disbled-text-color)", textAlign: "center" }}>No builds found.</div>;
    return <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginLeft: "7px" }}>
        {builds.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} guardedLinks={true} />)}
    </div>
}

export default function RatingModalContent({ modalId, type, id, getCommunityReviews, getUserReviews, onChange }) {
    const { user } = useAuth();
    const { setModalBeforeClose } = useModal();
    const [identities, identitiesLoading] = useData("identities_mini")
    const [egos, egosLoading] = useData("egos_mini");
    const [, updateCount] = useState(0);
    const [tab, setTab, tabInitialized] = useLocalState("ratingModalTab", "top");
    const [builds, setBuilds] = useState(null);
    const { isDesktop } = useBreakpoint();

    const [reviewText, setReviewText] = useState("");
    const [isReviewing, setIsReviewing] = useState(false);

    const [dbUserReview, setDbUserReview] = useState(null);
    const [dbCommunityRating, setDbCommunityRating] = useState(null);

    const triggerRender = useCallback(() => { updateCount(p => p + 1) }, []);

    const handleChange = async x => {
        await onChange?.(x);

        if (!getUserReviews) {
            const modEntry = (global, user, delta) => {
                if (!user) return global;

                const scores = getReviewScores(user);
                if (!global) return { votes: 1, rating: scores, overallRating: getOverallScore(scores) };

                const votesDelta = scores.some(x => x > 0) ? delta : 0;
                const newRating = global.rating.map((score, i) => ((score * global.votes) + delta * scores[i]) / (global.votes + votesDelta));
                return {
                    votes: global.votes + votesDelta,
                    rating: newRating,
                    overallRating: getOverallScore(newRating)
                }
            }

            if (x === null) {
                const newReviews = modEntry(dbCommunityRating, dbUserReview, -1);
                if (newReviews.votes === 0) setDbCommunityRating(null);
                else setDbCommunityRating(newReviews);
                setDbUserReview(null);
                return;
            }

            setDbCommunityRating(p => modEntry(modEntry(p, dbUserReview, -1), x, 1));
            setDbUserReview(x);
        }

        setTimeout(() => {
            triggerRender();
        }, 0);
    }

    useEffect(() => {
        const fetch = async () => {
            if (!getUserReviews) setDbUserReview(await getUserReview({ userId: user.id, itemType: type, itemId: id }));
            if (!getCommunityReviews) setDbCommunityRating(await getItemAggregates({ itemType: type, itemId: id }));
        }

        fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const review = getUserReviews ? getUserReviews()[id] : dbUserReview;
    const communityRating = getCommunityReviews ? getCommunityReviews()[id] : dbCommunityRating;

    useEffect(() => {
        const fetchBuilds = async () => {
            const params = { published: true, sortBy: "top" };
            if (type === "identity") params["identities"] = [id];
            else if (type === "ego") params["egos"] = [id];

            setBuilds(await searchBuilds(params, 1, 20) || []);
        }

        if (tab === "builds" && !builds) fetchBuilds();
    }, [type, tab, builds, id])

    useEffect(() => {
        setModalBeforeClose(modalId, () => {
            if (!isReviewing) return true;
            return window.confirm("You're currently creating or editing a review.\nDiscard unsaved changes?");
        });
    }, [modalId, isReviewing, setModalBeforeClose]);

    const name = type === "identity" ?
        (identitiesLoading ? "" : `[${sinnerIdMapping[identities[id].sinnerId]}] ${identities[id].name}`) :
        (egosLoading ? "" : `[${sinnerIdMapping[egos[id].sinnerId]}] ${egos[id].name}`)

    return <div style={{ display: "flex", flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? null : "center", gap: "0.5rem", maxHeight: "80vh" }}>
        <div style={{ maxWidth: "min(340px, 100%)", paddingBottom: "2rem" }}>
            <h2 className="title-text" style={{ textAlign: "center" }}>{name}</h2>
            <RatingComponent
                type={type} id={id} globalData={communityRating} userData={review} onChange={handleChange}
                reviewText={reviewText} setReviewText={setReviewText} isReviewing={isReviewing} setIsReviewing={setIsReviewing}
            />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "min(320px, 90vw)", flex: 1, minHeight: 0 }}>
            {isReviewing && <>
                <span className="title-text" style={{ textAlign: "center" }}>Review</span>
                <div style={{ width: "100%" }}>
                    <MarkdownEditorWrapper
                        value={reviewText}
                        onChange={v => setReviewText(v)}
                        placeholder={`Leave a review for this ${type === "identity" ? "identity" : "E.G.O"} (optional)...`}
                        guardedLinks={true}
                    />
                </div>
            </>
            }
            <div style={{ alignSelf: "center", maxWidth: "90vw", overflowX: "auto", overflowY: "hidden", padding: "0.25rem", boxSizing: "border-box", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "1rem", width: "max-content" }}>
                    <div className={`tab-header ${tab === "latest" ? "active" : ""}`} onClick={() => setTab("latest")}>Latest</div>
                    <div className={`tab-header ${tab === "active" ? "active" : ""}`} onClick={() => setTab("active")}>Active</div>
                    <div className={`tab-header ${tab === "top" ? "active" : ""}`} onClick={() => setTab("top")}>Top</div>
                    <div className={`tab-header ${tab === "funny" ? "active" : ""}`} onClick={() => setTab("funny")}>Funny</div>
                    <div className={`tab-header ${tab === "details" ? "active" : ""}`} onClick={() => setTab("details")}>
                        {type === "identity" ? "Identity " : "E.G.O "}Details
                    </div>
                    <div className={`tab-header ${tab === "builds" ? "active" : ""}`} onClick={() => setTab("builds")}>Top Builds</div>
                </div>
            </div>
            <div style={isDesktop ? { overflowY: "auto", flex: 1, minHeight: 0 } : {}}>
                {tab === "details" ?
                    (type === "identity" ? <IdentityDetails id={id} /> : <EgoDetails id={id} />) :
                    (tab === "builds" ?
                        <BuildsTab builds={builds} /> :
                        (tabInitialized && <ReviewsComponent type={type} id={id} sortType={tab} userReview={!isReviewing ? review : null} guardedLinks={true} />)
                    )
                }
            </div>
        </div>
    </div>
}