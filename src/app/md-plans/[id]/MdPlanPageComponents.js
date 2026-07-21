"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useEffect, useState } from "react";

import styles from "./MdPlan.module.css";
import MdPlanPage from "./MdPlanPage";
import { useMdPlan } from "./MdPlanProvider";

import Gift from "@/app/components/gifts/Gift";
import IdentityIcon from "@/app/components/icons/IdentityIcon";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import ThemePackIcon from "@/app/components/icons/ThemePackIcon";
import { getGeneralTooltipProps } from "@/app/components/tooltips/GeneralTooltip";
import { giftTiers, keywords } from "@/app/lib/constants";
import { contentConfig } from "@/app/lib/contentConfig";

export function MdPlanPageLocalWrapper({ id }) {
    const [plan, setPlan] = useState(null);

    useEffect(() => {
        if (plan) return;

        const fetch = async () => {
            try {
                setPlan(await contentConfig.md_plans.local.get(Number(id)));
            } catch (e) {
                console.error("Unable to fetch build");
            }
        }

        fetch();
    }, [id, plan]);

    return <MdPlanPage id={id} plan={plan} />
}

export function TrackingButtons() {
    const { tracking, toggleTracking, resetTracking, sortMarked, setSortMarked, giftsSort, setGiftsSort, giftsSeparate, setGiftsSeparate } = useMdPlan();

    const handleGiftsSortButtonClick = () => {
        if (giftsSort === "default") setGiftsSort("tier");
        else if (giftsSort === "tier") setGiftsSort("keyword");
        else setGiftsSort("default");
    }

    const handleGiftsSeparateButtonClick = () => {
        if (giftsSeparate === "none") setGiftsSeparate("tier");
        else if (giftsSeparate === "tier") setGiftsSeparate("keyword");
        else setGiftsSeparate("none");
    }

    return <>
        <span style={{ fontSize: "1.2rem" }}>Tracking Mode</span>
        <span className="sub-text">Tracking mode allows you to mark gifts you&apos;ve obtained or theme packs you&apos;ve entered by clicking them. Any progress made is saved locally. Tracking mode is automatically activated if you have tracking data for this MD Plan, reset your tracking data if you want to disable this.</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
            <button onClick={() => toggleTracking()}>
                {tracking === null ? "Activate Tracking Mode" : "Deactivate Tracking Mode"}
            </button>
            {
                tracking ? <>
                    <button onClick={() => resetTracking()}>Reset Tracking</button>
                    <button className={`toggle-button ${sortMarked ? 'active' : ''}`} onClick={() => setSortMarked(p => !p)}>
                        Sort Marked Items to End
                    </button>
                    <button onClick={handleGiftsSortButtonClick}>
                        Sort Gifts: {giftsSort === "default" ? "Default" : (giftsSort === "tier" ? "By Tier" : "By Keyword")}
                    </button>
                    <button onClick={handleGiftsSeparateButtonClick} {...getGeneralTooltipProps("This will separate gifts in the Targeted Gifts section into separate sections.")}>
                        Separate Gifts: {giftsSeparate === "none" ? "Disabled" : (giftsSeparate === "tier" ? "By Tier" : "By Keyword")}
                    </button>
                </> :
                    null
            }
        </div>
    </>
}

export function GiftList({ giftIds, giftsData, panelList = false, center = true }) {
    const { tracking, giftsSort, sortMarked, toggleGift } = useMdPlan();

    if (!tracking)
        return <div className={styles.giftList} style={{ justifyContent: center ? "center" : "start" }}>
            {giftIds.map(giftId => <div key={giftId} className={`${styles.giftListGiftWrapper} ${panelList ? styles.inPanel : null}`}>
                <Gift gift={giftsData[giftId]} />
            </div>)}
        </div>

    let giftsList = [...giftIds];
    if (giftsSort === "tier") {
        giftsList = giftsList.sort((a, b) => {
            const ta = giftsData[a].tier;
            const tb = giftsData[b].tier;
            if (ta === tb) return Number(a) - Number(b);
            return tb.localeCompare(ta);
        })
    } else if (giftsSort === "keyword") {
        giftsList = giftsList.sort((a, b) => {
            const ka = keywords.findIndex(x => x === giftsData[a].keyword);
            const kb = keywords.findIndex(x => x === giftsData[b].keyword);
            if (ka === kb) return Number(a) - Number(b);
            return ka - kb;
        })
    }

    if (sortMarked) {
        const [marked, unmarked] = giftsList.reduce(([marked, unmarked], id) => {
            if (tracking.gifts.has(Number(id))) marked.push(id);
            else unmarked.push(id);
            return [marked, unmarked];
        }, [[], []]);
        giftsList = [...unmarked, ...marked];
    }

    return <div className={styles.giftList} style={{ justifyContent: center ? "center" : "start" }}>
        {giftsList.map(giftId => {
            const marked = tracking.gifts.has(Number(giftId));
            return <div key={giftId}
                className={`${styles.giftListGiftWrapper} ${panelList ? styles.inPanel : null} ${marked ? styles.marked : null}`}
                onClick={() => toggleGift(giftId, marked)}
            >
                <Gift gift={giftsData[giftId]} expandable={false} />
            </div>
        })}
    </div>
}

export function ThemePackList({ themePackIds, themePacksData }) {
    const { tracking, sortMarked, toggleThemePack } = useMdPlan();
    const { isMobile } = useBreakpoint();

    const scale = isMobile ? 0.4 : themePackIds.length > 1 ? 0.3 : 0.44;

    if (!tracking)
        return <div className={styles.themePackList}>
            {themePackIds.map(themePackId => <div key={themePackId}>
                <ThemePackIcon themePack={themePacksData[themePackId]} displayName={true} scale={scale} />
            </div>)}
        </div>

    let themePacksList;
    if (sortMarked) {
        const [marked, unmarked] = themePackIds.reduce(([marked, unmarked], id) => {
            if (tracking.themePacks.has(id)) marked.push(id);
            else unmarked.push(id);
            return [marked, unmarked];
        }, [[], []]);
        themePacksList = [...unmarked, ...marked];
    } else {
        themePacksList = themePackIds;
    }

    return <div className={styles.themePackList}>
        {themePacksList.map(themePackId => {
            const marked = tracking.themePacks.has(themePackId);
            return <div key={themePackId}
                className={`${styles.themePackListPackWrapper} ${marked ? styles.marked : null}`}
                onClick={() => toggleThemePack(themePackId, marked)}
            >
                <ThemePackIcon themePack={themePacksData[themePackId]} displayName={true} scale={scale} />
            </div>
        })}
    </div>

}

export function TargetGifts({ giftIds, giftsData }) {
    const { giftsSeparate } = useMdPlan();

    if (giftsSeparate === "none") {
        return <GiftList giftIds={giftIds} giftsData={giftsData} center={false} />;
    } else if (giftsSeparate === "tier") {
        const mapping = Object.fromEntries(giftTiers.map(tier => ([tier, []])));
        giftIds.forEach(id => mapping[giftsData[id].tier].push(id));

        return <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
            {Object.entries(mapping).map(([tier, gifts]) => gifts.length > 0 ?
                <React.Fragment key={tier}>
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Tier {tier}</span>
                    <GiftList giftIds={gifts} giftsData={giftsData} center={false} />
                </React.Fragment> :
                null
            )}
        </div>
    } else if (giftsSeparate === "keyword") {
        const mapping = Object.fromEntries(keywords.map(kw => ([kw, []])));
        giftIds.forEach(id => mapping[giftsData[id].keyword].push(id));

        return <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
            {Object.entries(mapping).map(([kw, gifts]) => gifts.length > 0 ?
                <React.Fragment key={kw}>
                    <span style={{ fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center" }}>
                        {kw !== "Keywordless" && <KeywordIcon id={kw} size={32} />} {kw}
                    </span>
                    <GiftList giftIds={gifts} giftsData={giftsData} center={false} />
                </React.Fragment> :
                null
            )}
        </div>
    }
}

export function SkillReplaceIdWrapper({ id }) {
    const { isMobile } = useBreakpoint();
    return <IdentityIcon id={id} size={isMobile ? 92 : 128} displayName={true} displayRarity={true} />
}