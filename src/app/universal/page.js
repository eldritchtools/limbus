"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";

import { useData } from "../components/DataProvider";
import Gift from "../components/gifts/Gift";
import KeywordIcon from "../components/icons/KeywordIcon";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";

function GiftRow({ list = null, dict = null, isSmall }) {
    return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isSmall ? 60 : 100}px, 1fr))`, width: "100%", justifyContent: "center" }}>
        {list ?
            list.map((giftId) => <Gift key={giftId} id={giftId} includeTooltip={true} scale={isSmall ? .6 : 1} />) :
            dict.map(([giftId, notes]) => <div key={giftId} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Gift id={giftId} includeTooltip={true} scale={isSmall ? .6 : 1} />
                <span style={{ whiteSpace: "pre-wrap" }}>{notes}</span>
            </div>)}
    </div>
}

function Container({ category, isSmall }) {
    return <div style={{ display: "flex", flexDirection: "column", border: "1px #aaa dotted", borderRadius: "0.5rem", padding: "0.5rem", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{category.title}</div>
        {
            "gifts" in category ?
                <GiftRow list={category.gifts} isSmall={isSmall} /> :
                category.sections.map(section => <div key={section.title} style={{ display: "flex", flexDirection: "column" }}>
                    <div>{section.title}</div>
                    <GiftRow list={section.gifts} isSmall={isSmall} />
                </div>)
        }
    </div>
}

function ComboContainer({ data, isSmall }) {
    return <div style={{ display: "flex", flexDirection: "column", border: "1px #aaa dotted", borderRadius: "0.5rem", padding: "0.5rem", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center" }}><KeywordIcon id={data.title} />{data.title}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
            {data.sections.map((section, index) =>
                <div key={section.title} style={{ display: "flex", flexDirection: "column", borderRight: index === 0 ? "1px #aaa dotted" : null, padding: "0.5rem" }}>
                    <div style={{ fontSize: "1rem", fontWeight: "bold" }}>{section.title}</div>
                    {<GiftRow dict={section.gifts} isSmall={isSmall} />}
                </div>
            )}

        </div>
    </div>
}

export default function UniversalGiftsPage() {
    const { isDesktop } = useBreakpoint();
    const [universalGifts, universalGiftsLoading] = useData("md/universal_gifts");
    const isSmall = !isDesktop;

    if (universalGiftsLoading) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center", textAlign: "center", width: "100%" }}>
        <h2 style={{ margin: 0 }}>Universal Gifts & Gift Combos</h2>
        These are gifts or gift combos that have benefits for all or most team compositions. The combos especially are useful when running MD Extreme or for challenge runs. They can still be useful but are not necessary for MD Infinity.
        <br />
        These are not exhaustive lists. They only include some of the most relevant examples. Gifts that fall under multiple categories may be included in only one of them. This also does not include gifts from hidden bosses and EX gifts since they cannot be obtained by normal means.
        <br />
        I have tried to order them by relevance for each category, but this varies between team compositions and different situations, so take the ordering with a grain of salt. I have deprioritized gifts that have conditions that aren{"'"}t always achievable like killing enemies.
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, ${isSmall ? 320 : 520}px)`, width: "100%", justifyContent: "center" }}>
            {universalGifts.individual.map(category => <Container key={category.title} category={category} isSmall={isSmall} />)}
        </div>
        All 7 archetypes have combinations of gifts that can provide benefits for all team compositions. Gifts will generally be Enablers (gifts that apply the status) or Exploiters (gifts that provide benefits against enemies with the status), with some being both.
        <div style={{ display: "grid", gridTemplateColumns: "1fr", width: "100%" }}>
            {universalGifts.combo.map(status => <ComboContainer key={status.title} data={status} isSmall={isSmall} />)}
        </div>
    </div>;
}
