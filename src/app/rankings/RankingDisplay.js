import { useBreakpoint } from "@eldritchtools/shared-components";
import React from "react";

import RankingItemDisplay from "./RankingItemDisplay";

export default function RankingDisplay({
    viewMode, items, modalOnChange, onClick,
    reviews, reviewsRef, userReviews, userReviewsRef,
    showBreakdown, separateByPoint
}) {
    const { isMobile } = useBreakpoint();

    const itemWidth = isMobile ? 92 : 128;
    const widthMultiplier = showBreakdown ? 2 : 1;

    const getItemType = item => item.id[0] === "1" ? "identity" : "ego";

    const listToComponents = (list, multiplier, bottomBorder) =>
        <div style={{
            display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${itemWidth * (multiplier ? widthMultiplier : 1)}px, 1fr))`,
            width: "100%", gap: "0.5rem",
            paddingBottom: bottomBorder ? "0.5rem" : null,
            borderBottom: bottomBorder ? "2px var(--secondary-border-color) solid" : null
        }}>
            {list.map(([cs, , item, rank]) =>
                <RankingItemDisplay
                    key={item.id} type={viewMode ?? getItemType(item)} item={item} rank={rank} rankingScore={cs}
                    communityScore={reviews[item.id]}
                    communityReviewsRef={reviewsRef}
                    userScore={userReviews?.[item.id]}
                    userReviewsRef={userReviewsRef}
                    showBreakdown={showBreakdown}
                    onClick={onClick ? () => onClick(reviews[item.id]) : null}
                    modalOnChange={modalOnChange ? x => modalOnChange(item.id, x) : null}
                />
            )}
        </div>

    if (separateByPoint) {
        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
            {Object.entries(items)
                .filter(([threshold]) => threshold !== "none")
                .sort((a, b) => b[0] - a[0])
                .map(([threshold, list]) =>
                    <React.Fragment key={threshold}>
                        <div className="title-text" style={{ paddingBottom: "0.5rem", borderBottom: "2px var(--secondary-border-color) solid", textAlign: "center" }}>
                            {threshold}{threshold === "10" ? "" : "+"}
                        </div>
                        {listToComponents(list, true, true)}
                    </React.Fragment>
                )
            }
            {items["none"]?.length > 0 && <>
                <div className="title-text" style={{ paddingBottom: "0.5rem", borderBottom: "2px var(--secondary-border-color) solid", textAlign: "center" }}>
                    Unranked
                </div>
                {("none" in items) && listToComponents(items["none"], false, false)}
            </>
            }
        </div>
    } else {
        const [ranked, unranked] = items.reduce(([r, u], item) => {
            if (item[0] === null) u.push(item);
            else r.push(item);
            return [r, u];
        }, [[], []]);

        return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
            {listToComponents(ranked, true, false)}
            {unranked.length > 0 && <>
                <span className="title-text">Unranked</span>
                {listToComponents(unranked, false, false)}
            </>
            }
        </div>
    }
}