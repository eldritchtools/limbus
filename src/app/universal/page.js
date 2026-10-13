"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useMemo, useRef, useState } from "react";

import { useData } from "../components/DataProvider";
import Gift from "../components/gifts/Gift";
import KeywordIcon from "../components/icons/KeywordIcon";
import PageHeader from "../components/pageTemplates/PageHeader";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { getLocalStore } from "../database/localDB";
import { checkFilterMatch } from "../lib/filter";
import useLocalState from "../lib/useLocalState";

function Container({ category, keyword, titlePrefix, searchString, includeDesc, hideUnfiltered, tracking, setTracking }) {
    const { isMobile } = useBreakpoint();
    const [giftsData, giftsLoading] = useData("gifts");

    const gifts = useMemo(() => {
        if (giftsLoading) return [];
        const result = [];
        const markedList = [];

        const constructGift = (id, additionalText, filtered, marked) => {
            const filterStyle = !filtered || marked ? { filter: "brightness(0.4)" } : {};

            const toggleGift = tracking ?
                () => {
                    const newSet = new Set(tracking);
                    if (marked) newSet.delete(Number(id));
                    else newSet.add(Number(id));
                    setTracking(newSet);
                } :
                null;

            return <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: isMobile ? "60px" : "100px", ...filterStyle }} onClick={toggleGift}>
                <Gift id={id} includeTooltip={true} scale={isMobile ? .6 : 1} expandable={!tracking} />
                <span style={{ whiteSpace: "pre-wrap" }}>{additionalText}</span>
            </div>
        }

        category.gifts.forEach(gift => {
            let giftId, additionalText;
            if (Array.isArray(gift)) [giftId, additionalText] = gift;
            else giftId = gift;

            const giftData = giftsData[giftId];
            const labels = [giftData.names[0]];
            if (includeDesc) labels.push(giftData.search_desc);

            const marked = tracking ? tracking.has(giftId) : false;

            if (searchString.length > 0 && !checkFilterMatch(searchString, labels)) {
                if (hideUnfiltered) return;
                if (marked)
                    markedList.push(constructGift(giftId, additionalText, false, marked))
                else
                    result.push(constructGift(giftId, additionalText, false, marked));
            } else {
                if (marked)
                    markedList.push(constructGift(giftId, additionalText, true, marked))
                else
                    result.push(constructGift(giftId, additionalText, true, marked));
            }
        })

        return [...result, ...markedList];
    }, [category, searchString, includeDesc, hideUnfiltered, giftsData, giftsLoading, isMobile, tracking, setTracking]);

    if (gifts.length === 0) return null;

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            {keyword && <KeywordIcon id={keyword} />}
            {titlePrefix ?
                <>
                    <div className="title-text">{titlePrefix}</div>
                    <span className="sub-text" >({category.title})</span>
                </> :
                <div className="title-text">{category.title}</div>
            }
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
            {gifts}
        </div>
    </div>
}

function Category({ keyword, category, titlePrefix, searchString, includeDesc, hideUnfiltered, tracking, setTracking }) {
    const props = { searchString, includeDesc, hideUnfiltered, tracking, setTracking };

    if (category.sections)
        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {category.sections.map(section =>
                <Category key={section.title} keyword={keyword} category={section} titlePrefix={category.title} {...props} />
            )}
        </div>

    return <Container keyword={keyword} category={category} titlePrefix={titlePrefix} {...props} />
}

export default function UniversalGiftsPage() {
    const [universalGifts, universalGiftsLoading] = useData("md/universal_gifts");
    const [searchString, setSearchString] = useState("");
    const [includeDesc, setIncludeDesc] = useLocalState("universalIncludeDesc", false);
    const [hideUnfiltered, setHideUnfiltered] = useLocalState("universalHideUnfiltered", false);
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const saveTimeout = useRef(null);
    const [firstSave, setFirstSave] = useState(true);

    useEffect(() => {
        if (loading) {
            getLocalStore("universalTracking").get("main").then(x => {
                setLoading(false);
                if (!x) return;
                setTracking(new Set(x.gifts));
            });
        }
    }, [loading]);

    useEffect(() => {
        if (loading || !tracking) return;

        const saveData = async () => {
            if (firstSave) {
                triggerToolUsedGAEvent("Universal Tracking");
                setFirstSave(false);
            }

            const data = { id: "main", gifts: [...tracking] };
            if (data.gifts.length === 0)
                getLocalStore("universalTracking").remove("main");
            else
                getLocalStore("universalTracking").save(data);
        };

        clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            try {
                await saveData();
            } catch (err) {
                console.error("Unable to persist data.");
            }
        }, 1000);

        return () => clearTimeout(saveTimeout.current);
    }, [tracking, loading, firstSave]);

    const toggleTracking = () => {
        if (tracking) {
            setTracking(null);
            return;
        }

        getLocalStore("universalTracking").get("main").then(x => {
            if (x) setTracking(new Set(x.gifts));
            else setTracking(new Set());
        });
    }

    const resetTracking = () => {
        setTracking(new Set());
        getLocalStore("universalTracking").remove("main");
    }

    const props = { searchString, includeDesc, hideUnfiltered, tracking, setTracking };

    return <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center", textAlign: "center", width: "100%" }}>
        <PageHeader
            title={"Universal Gifts & Gift Combos"}
            mainDesc={"View Universal E.G.O Gifts and Gift Combos that are useful for most team compositions in Mirror Dungeons."}
            subDesc={<>
                This page lists Gifts and Gift combinations that have benefits for most team compositions in Mirror Dungeons. Universal Gifts provide a benefit without requiring a particular team composition or status archetype, while Gift Combos describe combinations of Gifts that can provide useful effects when used together. Gift combos are especially useful for Infinity, Extreme, or Challenge runs.
                <br /> <br />
                Items are loosely ordered by relevance within each category, but this varies significantly depending on team composition and situation, so the ordering should be taken as a rough guide rather than a strict ranking. Gifts with unreliable conditions are placed lower on the list.
                <br /> <br />
                Some gifts require specific theme packs that may prevent you from obtaining other gifts. Use your discretion when planning routes. Gifts from hidden bosses or theme packs and EX gifts are excluded since they cannot be obtained by normal means.
                <br /> <br />
                A tracking mode is provided for users to mark gifts they&apos;ve obtained to help them during a run.

            </>}
            maxAds={1}
        >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", justifyContent: "center" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem", maxWidth: "350px" }}>
                    <span style={{ textAlign: 'end' }}>Search:</span>
                    <input type="text" placeholder="Search..." value={searchString} onChange={(e) => setSearchString(e.target.value)} />
                    <div />
                    <label
                        {...getGeneralTooltipProps("Include description when searching for gifts")}
                        style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}
                    >
                        <input type="checkbox" checked={includeDesc} onChange={e => setIncludeDesc(e.target.checked)} />
                        <span className="hover-text">Include description</span>
                    </label>
                    <div />
                    <label style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <input type="checkbox" checked={hideUnfiltered} onChange={e => setHideUnfiltered(e.target.checked)} />
                        Hide unfiltered gifts
                    </label>
                </div>
            </div>
        </PageHeader>

        <div style={{ display: "flex", gap: "0.25rem" }}>
            <button onClick={() => toggleTracking()}>
                {tracking === null ? "Activate Tracking Mode" : "Deactivate Tracking Mode"}
            </button>
            {
                tracking ? <>
                    <button onClick={() => resetTracking()}>Reset Tracking</button>
                </> :
                    null
            }
        </div>

        {!universalGiftsLoading &&
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", justifyContent: "center" }}>
                {universalGifts.individual.map(category => <Category key={category.title} category={category} {...props} />)}
            </div>
        }
        <h2 style={{ margin: 0 }}>Gift Combos</h2>
        <p style={{ maxWidth: "1000px", textAlign: "left", margin: 0 }}>
            All 7 main keywords have combinations of gifts that can provide benefits for all team compositions. Gifts will generally be Enablers (gifts that apply the status) or Exploiters (gifts that provide benefits against enemies with the status), with some being both. You need to have at least 1 Enabler in order to benefit from the Exploiters.
        </p>
        <p>
            When focusing on specific keywords, try to prioritize them in the following order (hover for more details):
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem", marginTop: "0.5rem" }}>
                <div {...getGeneralTooltipProps("Free Offense and Defense Level Down and Fragile automatically triggered every turn with Downpour, Melted Eyeball, and Bell of Truth. Bind and Paralyze from Reverberation also helps. Good wave clear potential on lower floors with Bio-venom Vial.")}>
                    <KeywordIcon id={"Tremor"} />
                </div>

                <div {...getGeneralTooltipProps("SP and Power reduction is a significant help on higher floors.")}>
                    <KeywordIcon id={"Sinking"} />
                </div>

                <div {...getGeneralTooltipProps("Gives everyone significant bonus damage and power with Clear Mirror, Calm Water, Cigarette Holder, and Finifugality. With enough gifts, everyone gets guaranteed crits every turn.")}>
                    <KeywordIcon id={"Poise"} />
                </div>

                <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>&gt;</span>

                <div {...getGeneralTooltipProps("Can give a decent amount of Offense level with Burning Fate and Charred Disk. Glimpse of Flames gives some free damage and Defense Level Down.")}>
                    <KeywordIcon id={"Burn"} />
                </div>

                <div {...getGeneralTooltipProps("Red-Stained Gossypium applies a decent amount of Offense and Defense level down.")}>
                    <KeywordIcon id={"Bleed"} />
                </div>

                <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>&gt;</span>

                <div {...getGeneralTooltipProps("Gives some clash power, damage up, and haste. Strange Glyph Inscriptions requires the Nocturnal Sweeping pack which may not be ideal for some teams.")}>
                    <KeywordIcon id={"Rupture"} />
                </div>

                <div {...getGeneralTooltipProps("Gives some offense level, damage up, and haste.")}>
                    <KeywordIcon id={"Charge"} />
                </div>

            </div>
        </p>
        {!universalGiftsLoading &&
            <div style={{ display: "grid", gridTemplateColumns: "1fr", width: "100%" }}>
                {universalGifts.combo.map(status => <Category key={status.title} keyword={status.title} category={status} {...props} />)}
            </div>
        }
    </div>;
}
