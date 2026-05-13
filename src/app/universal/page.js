"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useMemo, useState } from "react";

import { useData } from "../components/DataProvider";
import Gift from "../components/gifts/Gift";
import KeywordIcon from "../components/icons/KeywordIcon";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { checkFilterMatch } from "../lib/filter";
import useLocalState from "../lib/useLocalState";

function Container({ category, keyword, titlePrefix, searchString, includeDesc, hideUnfiltered }) {
    const { isMobile } = useBreakpoint();
    const [giftsData, giftsLoading] = useData("gifts");

    const gifts = useMemo(() => {
        if (giftsLoading) return [];
        const result = [];

        const constructGift = (id, additionalText, filtered) => {
            const filterStyle = !filtered ? { filter: "brightness(0.4)" } : {};
            return <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: isMobile ? "60px" : "100px", ...filterStyle }}>
                <Gift id={id} includeTooltip={true} scale={isMobile ? .6 : 1} />
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

            if (searchString.length > 0 && !checkFilterMatch(searchString, labels)) {
                if (hideUnfiltered) return;
                result.push(constructGift(giftId, additionalText, false));
            } else {
                result.push(constructGift(giftId, additionalText, true));
            }
        })

        return result;
    }, [category, searchString, includeDesc, hideUnfiltered, giftsData, giftsLoading, isMobile]);

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

function Category({ keyword, category, titlePrefix, searchString, includeDesc, hideUnfiltered }) {
    const props = { searchString, includeDesc, hideUnfiltered };

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

    if (universalGiftsLoading) return <LoadingContentPageTemplate />;

    const props = { searchString, includeDesc, hideUnfiltered };

    return <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center", textAlign: "center", width: "100%" }}>
        <h2 style={{ margin: 0 }}>Universal Gifts & Gift Combos</h2>
        <p style={{ maxWidth: "1000px", textAlign: "left" }}>
            These are gifts or gift combos that have benefits for all or most team compositions. The combos especially are useful when running MD Extreme or for challenge runs. They can still be useful but are not necessary for MD Infinity.
            <br /> <br />
            I have tried to order them by relevance for each category, but this varies between team compositions and different situations, so take the ordering with a grain of salt. I have deprioritized gifts that have conditions that aren&apos;t always achievable like killing enemies. Consider the first few in a list as generally worth aiming for, while the rest are nice to have depending on your team.
            <br /> <br />
            Note that some of these gifts require going to certain theme packs that may lock you from going after other more useful gifts. Use your discretion when planning out your runs. 
            <br /> <br />
            Gifts from hidden bosses or theme packs and EX gifts are excluded since they cannot be obtained by normal means.
        </p>

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

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", justifyContent: "center" }}>
            {universalGifts.individual.map(category => <Category key={category.title} category={category} {...props} />)}
        </div>
        <h2 style={{ margin: 0 }}>Gift Combos</h2>
        <p style={{ maxWidth: "1000px", textAlign: "left", margin: 0 }}>
            All 7 archetypes have combinations of gifts that can provide benefits for all team compositions. Gifts will generally be Enablers (gifts that apply the status) or Exploiters (gifts that provide benefits against enemies with the status), with some being both. You need to have at least 1 Enabler in order to benefit from the Exploiters.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", width: "100%" }}>
            {universalGifts.combo.map(status => <Category key={status.title} keyword={status.title} category={status} {...props} />)}
        </div>
    </div>;
}
